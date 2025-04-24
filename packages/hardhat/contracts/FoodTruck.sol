// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";

/**
 * @title FoodTruck
 * @dev A contract to manage a food truck business on the blockchain
 * @author Generated with Claude
 */
contract FoodTruck {
    // State Variables
    address public immutable owner;
    
    // Food types
    enum ItemType { Food, Drink, Dessert }
    
    // Item struct
    struct MenuItem {
        string name;
        uint256 price;  // in wei
        uint256 inventory;
        ItemType itemType;
        bool isAvailable;
    }
    
    // Storage
    mapping(uint256 => MenuItem) public menuItems;
    uint256 public menuItemCount = 0;
    
    // Order tracking
    struct Order {
        address customer;
        uint256[] itemIds;
        uint256[] quantities;
        uint256 totalPrice;
        uint256 timestamp;
        bool fulfilled;
    }
    
    mapping(uint256 => Order) public orders;
    uint256 public orderCount = 0;
    
    // Revenue tracking
    uint256 public totalRevenue = 0;
    
    // Events
    event ItemAdded(uint256 indexed itemId, string name, uint256 price, ItemType itemType);
    event ItemUpdated(uint256 indexed itemId, string name, uint256 price, uint256 inventory, bool isAvailable);
    event InventoryUpdated(uint256 indexed itemId, uint256 newInventory);
    event OrderPlaced(uint256 indexed orderId, address indexed customer, uint256 totalPrice);
    event OrderFulfilled(uint256 indexed orderId);
    
    // Constructor
    constructor(address _owner) {
        owner = _owner;
    }
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    modifier itemExists(uint256 _itemId) {
        require(_itemId < menuItemCount, "Item does not exist");
        _;
    }
    
    // Menu management functions
    
    /**
     * @dev Add a new item to the menu
     * @param _name Name of the item
     * @param _price Price in wei
     * @param _inventory Initial inventory quantity
     * @param _itemType Type of item (0=Food, 1=Drink, 2=Dessert)
     */
    function addMenuItem(
        string memory _name,
        uint256 _price,
        uint256 _inventory,
        ItemType _itemType
    ) public onlyOwner {
        menuItems[menuItemCount] = MenuItem({
            name: _name,
            price: _price,
            inventory: _inventory,
            itemType: _itemType,
            isAvailable: true
        });
        
        emit ItemAdded(menuItemCount, _name, _price, _itemType);
        menuItemCount++;
    }
    
    /**
     * @dev Update an existing menu item
     * @param _itemId ID of the item to update
     * @param _name New name
     * @param _price New price
     * @param _inventory New inventory level
     * @param _isAvailable Availability status
     */
    function updateMenuItem(
        uint256 _itemId,
        string memory _name,
        uint256 _price,
        uint256 _inventory,
        bool _isAvailable
    ) public onlyOwner itemExists(_itemId) {
        MenuItem storage item = menuItems[_itemId];
        item.name = _name;
        item.price = _price;
        item.inventory = _inventory;
        item.isAvailable = _isAvailable;
        
        emit ItemUpdated(_itemId, _name, _price, _inventory, _isAvailable);
    }
    
    /**
     * @dev Update inventory for an item
     * @param _itemId ID of the item
     * @param _newInventory New inventory level
     */
    function updateInventory(uint256 _itemId, uint256 _newInventory) 
        public 
        onlyOwner 
        itemExists(_itemId) 
    {
        menuItems[_itemId].inventory = _newInventory;
        emit InventoryUpdated(_itemId, _newInventory);
    }
    
    /**
     * @dev Toggle availability of a menu item
     * @param _itemId ID of the item
     * @param _isAvailable New availability status
     */
    function setItemAvailability(uint256 _itemId, bool _isAvailable) 
        public 
        onlyOwner 
        itemExists(_itemId) 
    {
        menuItems[_itemId].isAvailable = _isAvailable;
    }
    
    // Customer functions
    
    /**
     * @dev Place an order for multiple items
     * @param _itemIds Array of item IDs
     * @param _quantities Array of quantities for each item
     */
    function placeOrder(uint256[] memory _itemIds, uint256[] memory _quantities) 
        public 
        payable 
        returns (uint256) 
    {
        require(_itemIds.length > 0, "Order must include at least one item");
        require(_itemIds.length == _quantities.length, "Item IDs and quantities must match");
        
        uint256 totalCost = 0;
        
        // Calculate total cost and check inventory
        for (uint256 i = 0; i < _itemIds.length; i++) {
            uint256 itemId = _itemIds[i];
            uint256 quantity = _quantities[i];
            
            require(itemId < menuItemCount, "Item does not exist");
            MenuItem storage item = menuItems[itemId];
            
            require(item.isAvailable, "Item is not available");
            require(item.inventory >= quantity, "Not enough inventory");
            
            totalCost += item.price * quantity;
            
            // Reduce inventory
            item.inventory -= quantity;
        }
        
        require(msg.value >= totalCost, "Insufficient payment");
        
        // Create order
        orders[orderCount] = Order({
            customer: msg.sender,
            itemIds: _itemIds,
            quantities: _quantities,
            totalPrice: totalCost,
            timestamp: block.timestamp,
            fulfilled: false
        });
        
        // Update revenue
        totalRevenue += totalCost;
        
        // Refund excess payment
        if (msg.value > totalCost) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - totalCost}("");
            require(success, "Refund failed");
        }
        
        emit OrderPlaced(orderCount, msg.sender, totalCost);
        
        uint256 currentOrderId = orderCount;
        orderCount++;
        
        return currentOrderId;
    }
    
    /**
     * @dev Mark an order as fulfilled
     * @param _orderId ID of the order to fulfill
     */
    function fulfillOrder(uint256 _orderId) public onlyOwner {
        require(_orderId < orderCount, "Order does not exist");
        Order storage order = orders[_orderId];
        require(!order.fulfilled, "Order already fulfilled");
        
        order.fulfilled = true;
        emit OrderFulfilled(_orderId);
    }
    
    /**
     * @dev Get all menu items
     * @return All menu items in an array
     */
    function getAllMenuItems() public view returns (MenuItem[] memory) {
        MenuItem[] memory allItems = new MenuItem[](menuItemCount);
        
        for (uint256 i = 0; i < menuItemCount; i++) {
            allItems[i] = menuItems[i];
        }
        
        return allItems;
    }
    
    /**
     * @dev Get menu items by type
     * @param _itemType Type of items to return
     * @return Items of the specified type
     */
    function getMenuItemsByType(ItemType _itemType) public view returns (MenuItem[] memory) {
        // Count items of the specified type
        uint256 count = 0;
        for (uint256 i = 0; i < menuItemCount; i++) {
            if (menuItems[i].itemType == _itemType) {
                count++;
            }
        }
        
        // Create and populate the array
        MenuItem[] memory items = new MenuItem[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < menuItemCount; i++) {
            if (menuItems[i].itemType == _itemType) {
                items[index] = menuItems[i];
                index++;
            }
        }
        
        return items;
    }
    
    /**
     * @dev Withdraw funds from the contract
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Function to receive ETH
     */
    receive() external payable {}
} 
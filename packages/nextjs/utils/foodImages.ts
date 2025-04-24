// Food image mapping utility

// Map food names to image URLs
export const foodImages: Record<string, string> = {
  // Foods
  Cheeseburger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format",
  "Pizza Slice": "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=500&auto=format",
  "Hot Dog": "https://images.unsplash.com/photo-1612392062631-94a26d727ec5?w=500&auto=format",
  Fries: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format",

  // Drinks
  Soda: "https://images.unsplash.com/photo-1581636138162-438c19276871?w=500&auto=format",
  Water: "https://images.unsplash.com/photo-1564419320461-6870880221ad?w=500&auto=format",
  Coffee: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&auto=format",

  // Desserts
  "Ice Cream": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format",
  "Chocolate Chip Cookie": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&auto=format",
};

// Default image for items not in the map
export const defaultFoodImage = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format";

// Function to get image URL for a food item
export const getFoodImage = (name: string): string => {
  return foodImages[name] || defaultFoodImage;
};

// Function to get a placeholder image by item type
export const getPlaceholderByType = (itemType: number): string => {
  switch (itemType) {
    case 0: // Food
      return "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format";
    case 1: // Drink
      return "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=500&auto=format";
    case 2: // Dessert
      return "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format";
    default:
      return defaultFoodImage;
  }
};

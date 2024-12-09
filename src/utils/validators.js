// src/utils/validators.js
const validateSignupData = (data) => {
  const errors = [];

  // Validate name
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push('Please provide a valid email address');
  }

  // Validate phone
  const phoneRegex = /^[0-9]{11}$/;  // Assuming Bangladesh phone number format
  if (!data.phone || !phoneRegex.test(data.phone)) {
    errors.push('Please provide a valid 11-digit phone number');
  }

  // Validate password
  if (!data.password || data.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  return errors;
};


const validateMenuItem = (item) => {
  const errors = [];

  if (!item.name || item.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!item.type || ![
    "hot",
    "cold",
    "blended",
    "iced",
    "snack",
    "dessert",
    "specialty",
    "seasonal",
    "espresso-based",
    "alcoholic",
    "caffeine-free",
    "regional",
    "non-coffee",
    "decaffeinated",
    "spiced"
  ]
    .includes(item.type.toLowerCase())) {
    errors.push('Invalid item type. Must be one of: hot, cold, snack, dessert');
  }

  if (!item.price || isNaN(item.price) || item.price <= 0) {
    errors.push('Price must be a positive number');
  }

  return errors;
};

const validateOrderData = (data) => {
  const errors = [];

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push('Order must contain at least one item');
  }

  if (!data.totalAmount || isNaN(data.totalAmount) || data.totalAmount <= 0) {
    errors.push('Invalid total amount');
  }

  if (!data.deliveryAddress) {
    errors.push('Delivery address is required');
  }

  if (!data.phone || !/^[0-9]{11}$/.test(data.phone)) {
    errors.push('Valid phone number is required');
  }

  // Validate each item in the order
  if (data.items) {
    data.items.forEach((item, index) => {
      if (!item.menuItemId || !item.quantity || !item.unitPrice) {
        errors.push(`Invalid item data at position ${index + 1}`);
      }
    });
  }

  return errors;
};


module.exports = {
  validateSignupData,
  validateMenuItem,
  validateOrderData
};

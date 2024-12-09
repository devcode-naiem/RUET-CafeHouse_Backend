// src/controllers/menuController.js
const Menu = require('../models/Menu');
const logger = require('../utils/logger');
const { validateMenuItem } = require('../utils/validators');

const menuController = {
  async addItems(req, res) {
    try {
      const items = req.body;
      const itemsArray = Array.isArray(items) ? items : [items];

      // Validate all items
      const validationErrors = {};
      itemsArray.forEach((item, index) => {
        const errors = validateMenuItem(item);
        if (errors.length > 0) {
          validationErrors[index] = errors;
        }
      });

      if (Object.keys(validationErrors).length > 0) {
        return res.status(400).json({
          success: false,
          errors: validationErrors
        });
      }

      const result = await Menu.addItems(items);
      
      res.status(201).json({
        success: true,
        message: `Successfully added ${result.affectedRows} menu items`,
        data: result
      });

    } catch (error) {
      logger.error('Error in addItems controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding menu items'
      });
    }
  },

  async updateItems(req, res) {
    try {
      const items = req.body;
      const itemsArray = Array.isArray(items) ? items : [items];

      // Validate all items
      const validationErrors = {};
      itemsArray.forEach((item, index) => {
        if (!item.id) {
          validationErrors[index] = ['Item ID is required'];
        } else {
          const errors = validateMenuItem(item);
          if (errors.length > 0) {
            validationErrors[index] = errors;
          }
        }
      });

      if (Object.keys(validationErrors).length > 0) {
        return res.status(400).json({
          success: false,
          errors: validationErrors
        });
      }

      const results = await Menu.updateItems(items);
      
      res.json({
        success: true,
        message: 'Update operation completed',
        data: results
      });

    } catch (error) {
      logger.error('Error in updateItems controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating menu items'
      });
    }
  },

  async deleteItems(req, res) {

    
    try {
  
       const  id  = req.body.id;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'No item IDs provided'
        });
      }

      const result = await Menu.deleteItems(id);
      
      res.json({
        success: true,
        message: `Successfully deleted ${result.affectedRows} menu items`
      });

    } catch (error) {
      logger.error('Error in deleteItems controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting menu items'
      });
    }
  },

  async getItems(req, res) {
    try {
      const items = await Menu.getAllItems();
      
      res.json({
        success: true,
        data: items
      });

    } catch (error) {
      logger.error('Error in getItems controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving menu items'
      });
    }
  }
};

module.exports = menuController;
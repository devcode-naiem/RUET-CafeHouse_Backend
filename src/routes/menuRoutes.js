// src/routes/menuRoutes.js
const express = require('express');
const menuController = require('../controllers/menuController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Public route
router.get('/get', menuController.getItems);

// Protected routes (require authentication)
router.post('/add', menuController.addItems);
router.put('/update', menuController.updateItems);
router.delete('/delete', menuController.deleteItems);

module.exports = router;
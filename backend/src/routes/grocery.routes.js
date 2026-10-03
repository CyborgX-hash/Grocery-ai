const express = require('express');
const router = express.Router();
const groceryController = require('../controllers/grocery.controller');

// AI parsing & status
router.post('/parse', (req, res, next) => groceryController.parseMessages(req, res, next));
router.get('/ai-status', (req, res, next) => groceryController.getAiStatus(req, res, next));
router.get('/stats', (req, res, next) => groceryController.getStats(req, res, next));

// Grocery lists
router.post('/lists', (req, res, next) => groceryController.createList(req, res, next));
router.get('/lists', (req, res, next) => groceryController.getLists(req, res, next));
router.get('/lists/:id', (req, res, next) => groceryController.getListById(req, res, next));
router.delete('/lists/:id', (req, res, next) => groceryController.deleteList(req, res, next));
router.post('/lists/:id/complete-all', (req, res, next) => groceryController.markAllPurchased(req, res, next));
router.post('/lists/:id/items', (req, res, next) => groceryController.addItemToList(req, res, next));

// Individual grocery items
router.patch('/items/:id', (req, res, next) => groceryController.updateItem(req, res, next));
router.patch('/items/:id/purchase', (req, res, next) => groceryController.togglePurchase(req, res, next));
router.delete('/items/:id', (req, res, next) => groceryController.deleteItem(req, res, next));

module.exports = router;

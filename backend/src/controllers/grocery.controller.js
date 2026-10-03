const groceryParser = require('../services/ai/grocery-parser.service');
const groceryService = require('../services/grocery.service');
const env = require('../config/env');
const { parseMessageSchema, createGroceryListSchema, updateGroceryItemSchema } = require('../utils/validator');

class GroceryController {
  /**
   * Parse messy roommate messages with AI
   */
  async parseMessages(req, res, next) {
    try {
      const { message } = parseMessageSchema.parse(req.body);
      const parsedData = await groceryParser.parse(message, req.body.userId || 'default-roommate-user');
      res.json({
        success: true,
        data: parsedData,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get AI system status (Gemma vs Demo)
   */
  async getAiStatus(req, res) {
    res.json({
      success: true,
      data: {
        isGemmaConfigured: env.gemma.isConfigured,
        model: env.gemma.model,
        mode: env.gemma.isConfigured ? 'gemma-live' : 'demo',
        provider: env.gemma.isConfigured ? 'Open-Weight Gemma' : 'Demo Emulation Parser',
      },
    });
  }

  /**
   * Save a newly created grocery list
   */
  async createList(req, res, next) {
    try {
      const validated = createGroceryListSchema.parse(req.body);
      const list = await groceryService.createList({
        userId: req.body.userId || 'default-roommate-user',
        title: validated.title,
        rawInput: validated.rawInput,
        items: validated.items,
      });

      res.status(201).json({
        success: true,
        data: list,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get all grocery lists
   */
  async getLists(req, res, next) {
    try {
      const lists = await groceryService.getLists(req.query.userId || 'default-roommate-user');
      res.json({
        success: true,
        data: lists,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get single grocery list by ID
   */
  async getListById(req, res, next) {
    try {
      const list = await groceryService.getListById(req.params.id);
      if (!list) {
        return res.status(404).json({
          success: false,
          error: 'Grocery list not found.',
        });
      }

      res.json({
        success: true,
        data: list,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update grocery item
   */
  async updateItem(req, res, next) {
    try {
      const updates = updateGroceryItemSchema.parse(req.body);
      const item = await groceryService.updateItem(req.params.id, updates);
      res.json({
        success: true,
        data: item,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Toggle purchase status
   */
  async togglePurchase(req, res, next) {
    try {
      const { isPurchased } = req.body;
      const updated = await groceryService.togglePurchase(req.params.id, Boolean(isPurchased));
      res.json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Mark all items in list as purchased
   */
  async markAllPurchased(req, res, next) {
    try {
      const list = await groceryService.markAllPurchased(req.params.id);
      res.json({
        success: true,
        data: list,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Add a single item to an existing list
   */
  async addItemToList(req, res, next) {
    try {
      const item = await groceryService.addItemToList(req.params.id, req.body);
      res.status(201).json({
        success: true,
        data: item,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete an item
   */
  async deleteItem(req, res, next) {
    try {
      await groceryService.deleteItem(req.params.id);
      res.json({
        success: true,
        message: 'Item deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete entire list
   */
  async deleteList(req, res, next) {
    try {
      await groceryService.deleteList(req.params.id);
      res.json({
        success: true,
        message: 'Grocery list deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get dashboard statistics
   */
  async getStats(req, res, next) {
    try {
      const stats = await groceryService.getQuickStats(req.query.userId || 'default-roommate-user');
      res.json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new GroceryController();

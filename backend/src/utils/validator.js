const { z } = require('zod');

const parseMessageSchema = z.object({
  message: z.string().min(1, 'Please provide grocery messages to parse.'),
});

const groceryItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Item name is required'),
  quantity: z.number().positive().default(1),
  unit: z.string().default('packet'),
  category: z.string().default('General'),
  notes: z.string().nullable().optional(),
  status: z.enum(['active', 'cancelled', 'purchased']).default('active'),
  isPurchased: z.boolean().default(false),
  confidence: z.number().min(0).max(1).optional().default(1.0),
  matchedPreference: z.string().nullable().optional(),
});

const createGroceryListSchema = z.object({
  title: z.string().optional().default('Grocery List'),
  rawInput: z.string().default(''),
  items: z.array(groceryItemSchema).min(1, 'At least one grocery item must be included.'),
});

const updateGroceryItemSchema = z.object({
  name: z.string().min(1).optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(['active', 'cancelled', 'purchased']).optional(),
  isPurchased: z.boolean().optional(),
});

const preferenceSchema = z.object({
  itemName: z.string().min(1, 'Item name is required (e.g. Milk, Bread)'),
  preferredProduct: z.string().min(1, 'Preferred product brand or type is required (e.g. Amul Taaza)'),
  defaultQuantity: z.number().positive().default(1),
  defaultUnit: z.string().default('packet'),
  category: z.string().default('General'),
  notes: z.string().nullable().optional(),
});

module.exports = {
  parseMessageSchema,
  createGroceryListSchema,
  updateGroceryItemSchema,
  preferenceSchema,
};

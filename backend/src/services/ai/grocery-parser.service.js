const prisma = require('../../config/db');
const env = require('../../config/env');
const gemmaService = require('./gemma.service');
const mockParserService = require('./mock-parser.service');

class GroceryParserService {
  /**
   * Main parsing orchestrator
   * @param {string} rawMessages - Roommate messages
   * @param {string} [userId] - User ID for preferences context
   */
  async parse(rawMessages, userId = 'default-roommate-user') {
    if (!rawMessages || typeof rawMessages !== 'string' || rawMessages.trim().length === 0) {
      throw new Error('Please provide grocery messages to parse.');
    }

    // 1. Fetch relevant saved preferences for this household
    const preferences = await prisma.groceryPreference.findMany({
      where: userId ? { OR: [{ userId }, { userId: null }] } : {},
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    let result;
    const warnings = [];

    // 2. Route to Gemma or Demo Parser
    if (env.gemma.isConfigured) {
      try {
        console.log(`[AI] Dispatching message parsing to Gemma API (${env.gemma.model})...`);
        const gemmaResult = await gemmaService.parseMessages(rawMessages, preferences);
        result = {
          ...gemmaResult,
          aiMode: 'gemma',
          model: env.gemma.model,
          provider: 'Google Gemma (Open-Weight Model)',
        };
      } catch (gemmaErr) {
        console.warn('[AI] Gemma API call failed or timed out. Falling back to Demo Mode:', gemmaErr.message);
        warnings.push(`Gemma API connection issue (${gemmaErr.message}). Safely fell back to intelligent demo parser.`);
        result = mockParserService.parse(rawMessages, preferences);
        result.warnings = warnings;
      }
    } else {
      console.log('[AI] GEMMA_API_KEY not provided. Running in intelligent Demo AI Mode.');
      result = mockParserService.parse(rawMessages, preferences);
      result.warnings.push('Demo AI Mode active. Gemma API credentials can be connected anytime via .env');
    }

    // 3. Post-process & validate each item
    const validatedItems = result.items.map((item, idx) => ({
      id: `parsed-${Date.now()}-${idx}`,
      name: item.name ? String(item.name).trim() : 'Item',
      quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
      unit: item.unit ? String(item.unit).trim() : 'packet',
      category: item.category ? String(item.category).trim() : 'General',
      notes: item.notes ? String(item.notes).trim() : null,
      status: item.status === 'cancelled' ? 'cancelled' : 'active',
      isPurchased: false,
      confidence: typeof item.confidence === 'number' ? item.confidence : 0.95,
      matchedPreference: item.matchedPreference || null,
    }));

    return {
      rawInput: rawMessages,
      items: validatedItems,
      detectedLanguage: result.detectedLanguage || 'Hinglish / English',
      summary: result.summary || `Parsed ${validatedItems.length} items from messages`,
      warnings: result.warnings || [],
      aiMode: result.aiMode || (env.gemma.isConfigured ? 'gemma' : 'demo'),
      provider: result.provider || 'MessyList Open-Weight AI',
    };
  }
}

module.exports = new GroceryParserService();

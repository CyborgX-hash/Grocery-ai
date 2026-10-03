/**
 * Mock AI Parser for MessyList Demo Mode
 * Deterministically simulates Gemma open-weight reasoning on Hinglish/English roommate messages.
 */

// Category map for recognized items
const CATEGORY_MAP = {
  milk: 'Dairy',
  doodh: 'Dairy',
  bread: 'Bakery',
  pav: 'Bakery',
  eggs: 'Dairy & Eggs',
  ande: 'Dairy & Eggs',
  atta: 'Pantry & Grains',
  flour: 'Pantry & Grains',
  chips: 'Snacks',
  kurkure: 'Snacks',
  lays: 'Snacks',
  maggi: 'Snacks',
  noodles: 'Snacks',
  chai: 'Beverages',
  'chai patti': 'Beverages',
  tea: 'Beverages',
  coffee: 'Beverages',
  sugar: 'Pantry',
  cheeni: 'Pantry',
  rice: 'Pantry & Grains',
  chawal: 'Pantry & Grains',
  dal: 'Pantry & Grains',
  daal: 'Pantry & Grains',
  oil: 'Pantry',
  tel: 'Pantry',
  butter: 'Dairy',
  paneer: 'Dairy',
  cheese: 'Dairy',
  apples: 'Produce',
  bananas: 'Produce',
  kela: 'Produce',
  aloo: 'Produce',
  potatoes: 'Produce',
  pyaaz: 'Produce',
  onions: 'Produce',
  tamatar: 'Produce',
  tomatoes: 'Produce',
};

// Item canonical normalization map
const CANONICAL_NAMES = {
  doodh: 'Milk',
  milk: 'Milk',
  bread: 'Bread',
  eggs: 'Eggs',
  ande: 'Eggs',
  atta: 'Atta',
  chips: 'Chips',
  kurkure: 'Kurkure',
  lays: 'Lays Chips',
  maggi: 'Maggi Noodles',
  chai: 'Tea Leaves (Chai)',
  'chai patti': 'Tea Leaves (Chai)',
  tea: 'Tea Leaves',
  coffee: 'Coffee',
  sugar: 'Sugar',
  cheeni: 'Sugar',
  rice: 'Rice',
  chawal: 'Rice',
  dal: 'Dal',
  daal: 'Dal',
  butter: 'Butter',
  paneer: 'Paneer',
  cheese: 'Cheese',
  apples: 'Apples',
  bananas: 'Bananas',
  kela: 'Bananas',
  aloo: 'Potatoes (Aloo)',
  pyaaz: 'Onions (Pyaaz)',
  tamatar: 'Tomatoes (Tamatar)',
};

class MockParserService {
  parse(rawInput, preferences = []) {
    const lines = rawInput
      .split(/\n|,|\./)
      .map((l) => l.trim())
      .filter(Boolean);

    const itemsMap = new Map(); // key: canonical name lowercase
    let lastItemKey = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();

      // 1. Detect cancellation or delegation (e.g. "actually Rahul eggs la raha", "Rahul la raha", "don't buy X", "mummy bhej rahi")
      const cancellationMatch = this.detectCancellation(line);
      if (cancellationMatch) {
        const { itemKey, reason } = cancellationMatch;
        if (itemsMap.has(itemKey)) {
          const item = itemsMap.get(itemKey);
          item.status = 'cancelled';
          item.notes = reason;
        } else {
          // Item cancelled before or mentioned in cancellation line
          const canonical = this.getCanonicalName(itemKey);
          itemsMap.set(itemKey, {
            name: canonical,
            quantity: 1,
            unit: this.getDefaultUnit(itemKey),
            category: CATEGORY_MAP[itemKey] || 'General',
            notes: reason,
            status: 'cancelled',
            confidence: 0.98,
          });
        }
        continue;
      }

      // 2. Detect modifiers referring to previous item
      // e.g. "brown wali", "5kg wala", "2 packet", "jo last time li thi"
      if (lastItemKey && itemsMap.has(lastItemKey)) {
        const prevItem = itemsMap.get(lastItemKey);
        let handledModifier = false;

        // Check quantity/unit modifier like "5kg wala" or "2 packet"
        const qtyMatch = line.match(/(\d+(?:\.\d+)?)\s*(kg|g|packet|pkt|packs?|bottles?|litres?|l|dozen|pieces?|pcs)/i);
        if (qtyMatch) {
          prevItem.quantity = parseFloat(qtyMatch[1]);
          prevItem.unit = this.normalizeUnit(qtyMatch[2]);
          handledModifier = true;
        } else if (line.match(/^(\d+(?:\.\d+)?)\s*wala/i)) {
          const numMatch = line.match(/^(\d+(?:\.\d+)?)/);
          if (numMatch) {
            prevItem.quantity = parseFloat(numMatch[1]);
            handledModifier = true;
          }
        }

        // Check variant/type modifier like "brown wali"
        if (line.includes('brown')) {
          if (prevItem.name.toLowerCase().includes('bread')) {
            prevItem.name = 'Brown Bread';
            prevItem.notes = prevItem.notes ? `${prevItem.notes}; Brown variant` : 'Brown bread';
          } else {
            prevItem.notes = 'Brown variant';
          }
          handledModifier = true;
        }

        // Check reference to previous purchase like "jo last time li thi" / "wahi chips"
        if (line.includes('last time') || line.includes('pichli baar') || line.includes('wahi')) {
          prevItem.notes = prevItem.notes
            ? `${prevItem.notes}; same as previous purchase`
            : 'Same brand as previous purchase';
          handledModifier = true;
        }

        if (handledModifier && !this.containsNewItem(line)) {
          continue;
        }
      }

      // 3. Extract items from current line
      const extracted = this.extractItemFromLine(line);
      if (extracted) {
        itemsMap.set(extracted.key, extracted.item);
        lastItemKey = extracted.key;
      }
    }

    // 4. Enrich with saved roommate preferences
    const resultItems = Array.from(itemsMap.values()).map((item) => {
      const matchedPref = preferences.find(
        (p) =>
          p.itemName.toLowerCase() === item.name.toLowerCase() ||
          item.name.toLowerCase().includes(p.itemName.toLowerCase()) ||
          p.itemName.toLowerCase().includes(item.name.toLowerCase())
      );

      if (matchedPref) {
        item.matchedPreference = matchedPref.preferredProduct;
        // If user didn't specify an explicit specific product title, enrich with preference
        if (item.name === 'Milk' || item.name === 'Bread' || item.name === 'Eggs' || item.name === 'Atta') {
          item.name = matchedPref.preferredProduct;
        }
        if (!item.notes) {
          item.notes = `Roommate preference: ${matchedPref.preferredProduct}`;
        }
        // If quantity is default 1 and preference has a specific default, and line didn't specify qty
        if (item.quantity === 1 && matchedPref.defaultQuantity > 1) {
          item.quantity = matchedPref.defaultQuantity;
          item.unit = matchedPref.defaultUnit;
        }
      }

      return item;
    });

    return {
      items: resultItems,
      detectedLanguage: 'Hinglish / English',
      summary: `Identified ${resultItems.filter((i) => i.status === 'active').length} active items and ${
        resultItems.filter((i) => i.status === 'cancelled').length
      } cancelled/delegated items.`,
      warnings: [],
      aiMode: 'demo',
      provider: 'MessyList Open-Weight Gemma Emulation',
    };
  }

  detectCancellation(line) {
    // "actually Rahul eggs la raha", "Rahul is bringing eggs", "eggs Rahul le aayega"
    const rahulEggMatch = line.match(/(rahul|rohit|karan|mummy|someone|roommate).*?(egg|milk|bread|atta|sugar|cheeni)/i);
    if (rahulEggMatch) {
      const person = rahulEggMatch[1].charAt(0).toUpperCase() + rahulEggMatch[1].slice(1);
      const rawItem = rahulEggMatch[2].toLowerCase();
      const itemKey = this.findKeyFor(rawItem) || rawItem;
      return {
        itemKey,
        reason: `${person} is bringing ${itemKey}`,
      };
    }

    const itemFirstMatch = line.match(/(egg|milk|bread|atta|sugar|cheeni).*?(rahul|rohit|karan|mummy).*?(la raha|bringing|bhej)/i);
    if (itemFirstMatch) {
      const rawItem = itemFirstMatch[1].toLowerCase();
      const person = itemFirstMatch[2].charAt(0).toUpperCase() + itemFirstMatch[2].slice(1);
      const itemKey = this.findKeyFor(rawItem) || rawItem;
      return {
        itemKey,
        reason: `${person} is already bringing them`,
      };
    }

    // "no sugar", "don't buy X", "X mat lana"
    const dontBuyMatch = line.match(/(?:don'?t\s+get|don'?t\s+buy|mat\s+lena|no\s+need|no)\s+([a-z]+)/i);
    if (dontBuyMatch) {
      const rawItem = dontBuyMatch[1].toLowerCase();
      const itemKey = this.findKeyFor(rawItem) || rawItem;
      return {
        itemKey,
        reason: 'Cancelled by roommate message',
      };
    }

    return null;
  }

  findKeyFor(text) {
    const clean = text.toLowerCase().trim();
    // Direct or singular/plural check
    for (const key of Object.keys(CANONICAL_NAMES)) {
      if (clean === key || clean === key + 's' || clean + 's' === key || clean.includes(key) || key.includes(clean)) {
        return key;
      }
    }
    return null;
  }

  containsNewItem(line) {
    for (const key of Object.keys(CANONICAL_NAMES)) {
      if (line.includes(key)) return true;
    }
    return false;
  }

  extractItemFromLine(line) {
    let matchedKey = null;
    for (const key of Object.keys(CANONICAL_NAMES)) {
      // word boundary check
      const regex = new RegExp(`\\b${key}\\b`, 'i');
      if (regex.test(line) || line.includes(key)) {
        matchedKey = key;
        break;
      }
    }

    if (!matchedKey) {
      // Check for generic groceries like "chips", "maggi", "coffee"
      for (const [key, category] of Object.entries(CATEGORY_MAP)) {
        if (line.includes(key)) {
          matchedKey = key;
          break;
        }
      }
    }

    if (!matchedKey) return null;

    let quantity = 1;
    let unit = this.getDefaultUnit(matchedKey);
    let notes = null;

    // Check quantity and unit in same line
    const qtyRegex = /(\d+(?:\.\d+)?)\s*(kg|g|packet|pkt|packs?|bottles?|litres?|l|dozen|pieces?|pcs)/i;
    const qtyMatch = line.match(qtyRegex);
    if (qtyMatch) {
      quantity = parseFloat(qtyMatch[1]);
      unit = this.normalizeUnit(qtyMatch[2]);
    } else {
      // standalone number: e.g. "2 milk" or "milk 2" or "dozen"
      if (line.includes('dozen')) {
        quantity = 12;
        unit = 'pieces';
      } else {
        const numMatch = line.match(/\b(\d+)\b/);
        if (numMatch && !line.includes('402') && !line.includes('2026')) {
          quantity = parseInt(numMatch[1], 10);
        }
      }
    }

    // Specific nuances
    let name = this.getCanonicalName(matchedKey);
    if (matchedKey === 'bread' && line.includes('brown')) {
      name = 'Brown Bread';
      notes = 'Brown variant';
    } else if (matchedKey === 'chips' && (line.includes('wahi') || line.includes('last time'))) {
      notes = 'Same chips as last time';
    }

    return {
      key: matchedKey,
      item: {
        name,
        quantity,
        unit,
        category: CATEGORY_MAP[matchedKey] || 'General',
        notes,
        status: 'active',
        confidence: 0.96,
      },
    };
  }

  getCanonicalName(key) {
    if (CANONICAL_NAMES[key]) return CANONICAL_NAMES[key];
    return key.charAt(0).toUpperCase() + key.slice(1);
  }

  getDefaultUnit(key) {
    switch (key) {
      case 'milk':
      case 'doodh':
        return 'packet';
      case 'bread':
      case 'maggi':
      case 'chips':
      case 'kurkure':
      case 'lays':
        return 'pack';
      case 'eggs':
      case 'ande':
        return 'pieces';
      case 'atta':
      case 'sugar':
      case 'cheeni':
      case 'rice':
      case 'chawal':
      case 'dal':
      case 'daal':
        return 'kg';
      case 'oil':
      case 'tel':
        return 'litre';
      default:
        return 'packet';
    }
  }

  normalizeUnit(raw) {
    const lower = raw.toLowerCase();
    if (lower === 'pkt' || lower === 'packet' || lower === 'packets') return 'packet';
    if (lower === 'kg' || lower === 'kgs') return 'kg';
    if (lower === 'g' || lower === 'gm' || lower === 'gms') return 'g';
    if (lower === 'pack' || lower === 'packs') return 'pack';
    if (lower === 'bottle' || lower === 'bottles') return 'bottle';
    if (lower === 'l' || lower === 'litre' || lower === 'litres' || lower === 'liter') return 'litre';
    if (lower === 'piece' || lower === 'pieces' || lower === 'pcs') return 'pieces';
    if (lower === 'dozen') return 'dozen';
    return lower;
  }
}

module.exports = new MockParserService();

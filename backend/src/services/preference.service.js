const prisma = require('../config/db');

class PreferenceService {
  async getPreferences(userId = 'default-roommate-user') {
    return prisma.groceryPreference.findMany({
      where: {
        OR: [{ userId }, { userId: null }],
      },
      orderBy: { itemName: 'asc' },
    });
  }

  async createPreference(data, userId = 'default-roommate-user') {
    // Upsert preference based on itemName and userId
    return prisma.groceryPreference.create({
      data: {
        userId,
        itemName: data.itemName.trim(),
        preferredProduct: data.preferredProduct.trim(),
        defaultQuantity: Number(data.defaultQuantity) || 1,
        defaultUnit: data.defaultUnit || 'packet',
        category: data.category || 'General',
        notes: data.notes || null,
      },
    });
  }

  async updatePreference(id, data) {
    return prisma.groceryPreference.update({
      where: { id },
      data: {
        ...(data.itemName && { itemName: data.itemName.trim() }),
        ...(data.preferredProduct && { preferredProduct: data.preferredProduct.trim() }),
        ...(data.defaultQuantity !== undefined && { defaultQuantity: Number(data.defaultQuantity) }),
        ...(data.defaultUnit && { defaultUnit: data.defaultUnit.trim() }),
        ...(data.category && { category: data.category.trim() }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });
  }

  async deletePreference(id) {
    return prisma.groceryPreference.delete({
      where: { id },
    });
  }
}

module.exports = new PreferenceService();

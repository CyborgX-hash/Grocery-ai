const prisma = require('../config/db');

class GroceryService {
  /**
   * Create a new grocery list with items
   */
  async createList({ userId = 'default-roommate-user', title, rawInput, items }) {
    return prisma.$transaction(async (tx) => {
      // Create or ensure default user
      await tx.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          name: 'Rohan & Kabir (Room 402)',
        },
      });

      const list = await tx.groceryList.create({
        data: {
          userId,
          title: title || `Grocery List — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          rawInput: rawInput || '',
          status: 'active',
          items: {
            create: items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              unit: item.unit || 'packet',
              category: item.category || 'General',
              notes: item.notes || null,
              status: item.status || 'active',
              isPurchased: Boolean(item.isPurchased),
              confidence: item.confidence ?? 1.0,
              matchedPreference: item.matchedPreference || null,
            })),
          },
        },
        include: {
          items: {
            orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
          },
        },
      });

      return list;
    });
  }

  /**
   * Get all lists with progress statistics
   */
  async getLists(userId = 'default-roommate-user') {
    const lists = await prisma.groceryList.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    });

    return lists.map((list) => {
      const totalItems = list.items.length;
      const activeItems = list.items.filter((i) => i.status === 'active');
      const cancelledItems = list.items.filter((i) => i.status === 'cancelled');
      const purchasedItems = activeItems.filter((i) => i.isPurchased);

      return {
        ...list,
        stats: {
          total: totalItems,
          active: activeItems.length,
          cancelled: cancelledItems.length,
          purchased: purchasedItems.length,
          pending: activeItems.length - purchasedItems.length,
          percentComplete: activeItems.length > 0 ? Math.round((purchasedItems.length / activeItems.length) * 100) : 0,
        },
      };
    });
  }

  /**
   * Get a single list by ID
   */
  async getListById(id) {
    const list = await prisma.groceryList.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: [{ isPurchased: 'asc' }, { status: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });

    if (!list) return null;

    const totalItems = list.items.length;
    const activeItems = list.items.filter((i) => i.status === 'active');
    const cancelledItems = list.items.filter((i) => i.status === 'cancelled');
    const purchasedItems = activeItems.filter((i) => i.isPurchased);

    return {
      ...list,
      stats: {
        total: totalItems,
        active: activeItems.length,
        cancelled: cancelledItems.length,
        purchased: purchasedItems.length,
        pending: activeItems.length - purchasedItems.length,
        percentComplete: activeItems.length > 0 ? Math.round((purchasedItems.length / activeItems.length) * 100) : 0,
      },
    };
  }

  /**
   * Update item details (name, quantity, unit, notes, etc.)
   */
  async updateItem(id, updates) {
    return prisma.groceryItem.update({
      where: { id },
      data: updates,
    });
  }

  /**
   * Toggle purchase status
   */
  async togglePurchase(id, isPurchased) {
    const item = await prisma.groceryItem.update({
      where: { id },
      data: {
        isPurchased,
        purchasedAt: isPurchased ? new Date() : null,
      },
      include: {
        groceryList: {
          include: { items: true },
        },
      },
    });

    // Check if entire list is now completed
    const activeItems = item.groceryList.items.filter((i) => i.status === 'active');
    const allPurchased = activeItems.length > 0 && activeItems.every((i) => i.isPurchased);

    if (allPurchased && item.groceryList.status !== 'completed') {
      await prisma.groceryList.update({
        where: { id: item.groceryListId },
        data: { status: 'completed' },
      });
    } else if (!allPurchased && item.groceryList.status === 'completed') {
      await prisma.groceryList.update({
        where: { id: item.groceryListId },
        data: { status: 'active' },
      });
    }

    return item;
  }

  /**
   * Mark all active items in a list as completed
   */
  async markAllPurchased(listId) {
    await prisma.groceryItem.updateMany({
      where: { groceryListId: listId, status: 'active' },
      data: {
        isPurchased: true,
        purchasedAt: new Date(),
      },
    });

    await prisma.groceryList.update({
      where: { id: listId },
      data: { status: 'completed' },
    });

    return this.getListById(listId);
  }

  /**
   * Add a single item to an existing list
   */
  async addItemToList(listId, itemData) {
    return prisma.groceryItem.create({
      data: {
        groceryListId: listId,
        name: itemData.name,
        quantity: itemData.quantity || 1,
        unit: itemData.unit || 'packet',
        category: itemData.category || 'General',
        notes: itemData.notes || null,
        status: itemData.status || 'active',
      },
    });
  }

  /**
   * Delete an item
   */
  async deleteItem(id) {
    return prisma.groceryItem.delete({
      where: { id },
    });
  }

  /**
   * Delete a list
   */
  async deleteList(id) {
    return prisma.groceryList.delete({
      where: { id },
    });
  }

  /**
   * Quick dashboard statistics
   */
  async getQuickStats(userId = 'default-roommate-user') {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalPurchasedThisWeek, totalPending, totalRequestsProcessed, totalPreferences] = await Promise.all([
      prisma.groceryItem.count({
        where: {
          groceryList: { userId },
          isPurchased: true,
          purchasedAt: { gte: oneWeekAgo },
        },
      }),
      prisma.groceryItem.count({
        where: {
          groceryList: { userId, status: 'active' },
          status: 'active',
          isPurchased: false,
        },
      }),
      prisma.groceryList.count({
        where: { userId },
      }),
      prisma.groceryPreference.count({
        where: { OR: [{ userId }, { userId: null }] },
      }),
    ]);

    return {
      itemsBoughtThisWeek: totalPurchasedThisWeek,
      itemsPending: totalPending,
      groceryRequestsProcessed: totalRequestsProcessed,
      savedPreferences: totalPreferences,
    };
  }
}

module.exports = new GroceryService();

const preferenceService = require('../services/preference.service');
const { preferenceSchema } = require('../utils/validator');

class PreferencesController {
  async getPreferences(req, res, next) {
    try {
      const preferences = await preferenceService.getPreferences(req.query.userId || 'default-roommate-user');
      res.json({
        success: true,
        data: preferences,
      });
    } catch (err) {
      next(err);
    }
  }

  async createPreference(req, res, next) {
    try {
      const validated = preferenceSchema.parse(req.body);
      const pref = await preferenceService.createPreference(validated, req.body.userId || 'default-roommate-user');
      res.status(201).json({
        success: true,
        data: pref,
      });
    } catch (err) {
      next(err);
    }
  }

  async updatePreference(req, res, next) {
    try {
      const pref = await preferenceService.updatePreference(req.params.id, req.body);
      res.json({
        success: true,
        data: pref,
      });
    } catch (err) {
      next(err);
    }
  }

  async deletePreference(req, res, next) {
    try {
      await preferenceService.deletePreference(req.params.id);
      res.json({
        success: true,
        message: 'Preference deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PreferencesController();

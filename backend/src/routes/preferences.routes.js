const express = require('express');
const router = express.Router();
const preferencesController = require('../controllers/preferences.controller');

router.get('/', (req, res, next) => preferencesController.getPreferences(req, res, next));
router.post('/', (req, res, next) => preferencesController.createPreference(req, res, next));
router.patch('/:id', (req, res, next) => preferencesController.updatePreference(req, res, next));
router.delete('/:id', (req, res, next) => preferencesController.deletePreference(req, res, next));

module.exports = router;

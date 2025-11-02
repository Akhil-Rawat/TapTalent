const express = require('express');
const quoteController = require('../controllers/quote.controller');

const router = express.Router();

/**
 * @route   GET /quotes
 * @desc    Get current USD exchange rates from all sources
 * @query   refresh - Force refresh data (optional)
 */
router.get('/quotes', quoteController.getQuotes.bind(quoteController));

/**
 * @route   GET /average
 * @desc    Get average buy and sell prices across all sources
 * @query   refresh - Force refresh data (optional)
 */
router.get('/average', quoteController.getAverage.bind(quoteController));

/**
 * @route   GET /slippage
 * @desc    Get slippage percentage for each source
 * @query   refresh - Force refresh data (optional)
 */
router.get('/slippage', quoteController.getSlippage.bind(quoteController));

/**
 * @route   GET /historical
 * @desc    Get historical quotes from database
 * @query   limit - Number of records to retrieve (default: 100)
 */
router.get('/historical', quoteController.getHistorical.bind(quoteController));

module.exports = router;

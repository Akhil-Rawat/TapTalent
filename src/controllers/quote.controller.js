const quoteService = require('../services/quote.service');
const logger = require('../utils/logger');

class QuoteController {
  async getQuotes(req, res, next) {
    try {
      const forceRefresh = req.query.refresh === 'true';
      const quotes = await quoteService.getQuotes(forceRefresh);
      
      res.json({
        success: true,
        data: quotes,
        count: quotes.length,
      });
    } catch (error) {
      logger.error('Error in getQuotes controller:', error);
      next(error);
    }
  }

  async getAverage(req, res, next) {
    try {
      const forceRefresh = req.query.refresh === 'true';
      const average = await quoteService.getAverage(forceRefresh);
      
      res.json({
        success: true,
        data: average,
      });
    } catch (error) {
      logger.error('Error in getAverage controller:', error);
      next(error);
    }
  }

  async getSlippage(req, res, next) {
    try {
      const forceRefresh = req.query.refresh === 'true';
      const slippage = await quoteService.getSlippage(forceRefresh);
      
      res.json({
        success: true,
        data: slippage,
        count: slippage.length,
      });
    } catch (error) {
      logger.error('Error in getSlippage controller:', error);
      next(error);
    }
  }

  async getHistorical(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 100;
      const quotes = await quoteService.getHistoricalQuotes(limit);
      
      res.json({
        success: true,
        data: quotes,
        count: quotes.length,
      });
    } catch (error) {
      logger.error('Error in getHistorical controller:', error);
      next(error);
    }
  }
}

module.exports = new QuoteController();

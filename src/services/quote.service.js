const scraperService = require('./scraper.service');
const cacheService = require('./cache.service');
const db = require('../database/db');
const config = require('../config/config');
const logger = require('../utils/logger');

class QuoteService {
  constructor() {
    this.CACHE_KEY = `quotes_${config.region}`;
  }

  async getQuotes(forceRefresh = false) {
    // Check cache first
    if (!forceRefresh) {
      const cachedQuotes = cacheService.get(this.CACHE_KEY);
      if (cachedQuotes) {
        logger.info('Returning quotes from cache');
        return cachedQuotes;
      }
    }

    // Scrape fresh data
    const { quotes, errors } = await scraperService.scrapeAll();

    // Save to database
    await this.saveQuotesToDb(quotes);

    // Cache the results
    cacheService.set(this.CACHE_KEY, quotes);

    return quotes;
  }

  async getAverage(forceRefresh = false) {
    const quotes = await this.getQuotes(forceRefresh);

    if (quotes.length === 0) {
      throw new Error('No quotes available to calculate average');
    }

    const totalBuy = quotes.reduce((sum, q) => sum + q.buy_price, 0);
    const totalSell = quotes.reduce((sum, q) => sum + q.sell_price, 0);

    const average = {
      average_buy_price: parseFloat((totalBuy / quotes.length).toFixed(4)),
      average_sell_price: parseFloat((totalSell / quotes.length).toFixed(4)),
      source_count: quotes.length,
      timestamp: new Date().toISOString(),
    };

    return average;
  }

  async getSlippage(forceRefresh = false) {
    const quotes = await this.getQuotes(forceRefresh);
    const average = await this.getAverage(forceRefresh);

    const slippages = quotes.map(quote => {
      const buyDiff = quote.buy_price - average.average_buy_price;
      const sellDiff = quote.sell_price - average.average_sell_price;

      const buySlippage = average.average_buy_price !== 0
        ? buyDiff / average.average_buy_price
        : 0;

      const sellSlippage = average.average_sell_price !== 0
        ? sellDiff / average.average_sell_price
        : 0;

      return {
        buy_price_slippage: parseFloat(buySlippage.toFixed(4)),
        sell_price_slippage: parseFloat(sellSlippage.toFixed(4)),
        absolute_buy_diff: parseFloat(buyDiff.toFixed(4)),
        absolute_sell_diff: parseFloat(sellDiff.toFixed(4)),
        source: quote.source,
        timestamp: quote.timestamp,
      };
    });

    return slippages;
  }

  async saveQuotesToDb(quotes) {
    try {
      const insertPromises = quotes.map(quote => {
        return db.run(
          `INSERT INTO quotes (region, source, buy_price, sell_price, timestamp) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            config.region,
            quote.source,
            quote.buy_price,
            quote.sell_price,
            quote.timestamp,
          ]
        );
      });

      await Promise.all(insertPromises);
      logger.debug(`Saved ${quotes.length} quotes to database`);
    } catch (error) {
      logger.error('Error saving quotes to database:', error);
      // Don't throw - this is not critical for the API to function
    }
  }

  async getHistoricalQuotes(limit = 100) {
    try {
      const quotes = await db.all(
        `SELECT * FROM quotes 
         WHERE region = ? 
         ORDER BY timestamp DESC 
         LIMIT ?`,
        [config.region, limit]
      );
      return quotes;
    } catch (error) {
      logger.error('Error fetching historical quotes:', error);
      throw error;
    }
  }
}

module.exports = new QuoteService();

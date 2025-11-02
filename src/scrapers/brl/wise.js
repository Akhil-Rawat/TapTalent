const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../../config/config');
const logger = require('../../utils/logger');

class WiseScraper {
  constructor() {
    this.source = 'https://wise.com/es/currency-converter/brl-to-usd-rate';
    this.name = 'Wise';
  }

  async scrape() {
    try {
      const response = await axios.get(this.source, {
        timeout: config.scraper.timeout,
        headers: {
          'User-Agent': config.scraper.userAgent,
        },
      });

      const $ = cheerio.load(response.data);
      
      // Wise shows the exchange rate prominently
      let rate = null;
      
      // Try to find the rate in the converter
      const rateText = $('.text-success, .cc__source-to-target__rate, [data-testid="rate-value"]')
        .first()
        .text()
        .trim();
      
      if (rateText) {
        // Extract number from text like "1 BRL = 0.20 USD"
        const matches = rateText.match(/[\d.,]+/g);
        if (matches && matches.length >= 2) {
          rate = parseFloat(matches[1].replace(',', '.'));
        }
      }

      if (!rate || isNaN(rate)) {
        // Fallback: try alternative selectors
        $('.rate-value, .conversion-rate').each((i, elem) => {
          const text = $(elem).text().trim();
          const parsed = parseFloat(text.replace(',', '.'));
          if (!isNaN(parsed) && parsed > 0 && parsed < 1) {
            rate = parsed;
          }
        });
      }

      if (!rate || isNaN(rate)) {
        throw new Error('Could not parse rate data from Wise');
      }

      // Convert to BRL per USD (inverse the rate if needed)
      // If rate is BRL to USD (< 1), we need USD to BRL
      const usdToBrl = rate < 1 ? 1 / rate : rate;
      
      // Wise typically doesn't show buy/sell spread, so we add a small estimated spread
      const spread = 0.02; // 2% spread estimation
      const buyPrice = usdToBrl * (1 - spread);
      const sellPrice = usdToBrl * (1 + spread);

      logger.debug(`${this.name} - Buy: ${buyPrice.toFixed(4)}, Sell: ${sellPrice.toFixed(4)}`);

      return {
        buy_price: parseFloat(buyPrice.toFixed(4)),
        sell_price: parseFloat(sellPrice.toFixed(4)),
        source: this.source,
      };
    } catch (error) {
      logger.error(`${this.name} scraper error:`, error.message);
      throw error;
    }
  }
}

module.exports = new WiseScraper();

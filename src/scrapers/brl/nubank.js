const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../../config/config');
const logger = require('../../utils/logger');

class NubankScraper {
  constructor() {
    this.source = 'https://nubank.com.br/taxas-conversao/';
    this.name = 'Nubank';
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
      
      let buyPrice = null;
      let sellPrice = null;

      // Nubank shows conversion rates in a table or specific divs
      $('table tr, .rate-item, .conversion-item').each((i, elem) => {
        const text = $(elem).text().toLowerCase();
        
        if (text.includes('dólar') || text.includes('usd')) {
          const values = $(elem).find('td, .value, .rate-value');
          
          values.each((j, val) => {
            const valText = $(val).text().trim();
            const parsed = parseFloat(valText.replace(',', '.').replace(/[^0-9.]/g, ''));
            
            if (!isNaN(parsed) && parsed > 1 && parsed < 10) {
              if (!buyPrice) {
                buyPrice = parsed;
              } else if (!sellPrice) {
                sellPrice = parsed;
              }
            }
          });
        }
      });

      // Fallback: Look for specific patterns
      if (!buyPrice || !sellPrice) {
        const bodyText = $('body').text();
        const matches = bodyText.match(/R\$\s*([\d,]+)/g);
        
        if (matches && matches.length >= 2) {
          buyPrice = parseFloat(matches[0].replace(/[^0-9,]/g, '').replace(',', '.'));
          sellPrice = parseFloat(matches[1].replace(/[^0-9,]/g, '').replace(',', '.'));
        }
      }

      // If we still don't have both values, estimate from one
      if (buyPrice && !sellPrice) {
        sellPrice = buyPrice * 1.04; // Add 4% spread
      } else if (sellPrice && !buyPrice) {
        buyPrice = sellPrice * 0.96; // Subtract 4% spread
      }

      if (!buyPrice || !sellPrice || isNaN(buyPrice) || isNaN(sellPrice)) {
        throw new Error('Could not parse price data from Nubank');
      }

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

module.exports = new NubankScraper();

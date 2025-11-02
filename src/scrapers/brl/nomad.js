const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../../config/config');
const logger = require('../../utils/logger');

class NomadScraper {
  constructor() {
    this.source = 'https://www.nomadglobal.com';
    this.name = 'Nomad';
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

      // Nomad typically shows the exchange rate on their homepage
      $('.exchange-rate, .rate-display, [data-testid="exchange-rate"]').each((i, elem) => {
        const text = $(elem).text().trim();
        const parsed = parseFloat(text.replace(',', '.').replace(/[^0-9.]/g, ''));
        
        if (!isNaN(parsed) && parsed > 1 && parsed < 10) {
          if (!buyPrice) {
            buyPrice = parsed;
          } else if (!sellPrice) {
            sellPrice = parsed;
          }
        }
      });

      // Try to find rates in any numeric content
      if (!buyPrice || !sellPrice) {
        $('p, span, div').each((i, elem) => {
          const text = $(elem).text();
          if (text.includes('R$') || text.toLowerCase().includes('dólar')) {
            const matches = text.match(/[\d,]+/g);
            if (matches) {
              matches.forEach(match => {
                const parsed = parseFloat(match.replace(',', '.'));
                if (!isNaN(parsed) && parsed > 1 && parsed < 10) {
                  if (!buyPrice) {
                    buyPrice = parsed;
                  } else if (!sellPrice && Math.abs(parsed - buyPrice) > 0.01) {
                    sellPrice = parsed;
                  }
                }
              });
            }
          }
        });
      }

      // If we have one value, estimate the other
      if (buyPrice && !sellPrice) {
        sellPrice = buyPrice * 1.03; // Add 3% spread
      } else if (sellPrice && !buyPrice) {
        buyPrice = sellPrice * 0.97; // Subtract 3% spread
      }

      if (!buyPrice || !sellPrice || isNaN(buyPrice) || isNaN(sellPrice)) {
        throw new Error('Could not parse price data from Nomad');
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

module.exports = new NomadScraper();

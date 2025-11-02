const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../../config/config');
const logger = require('../../utils/logger');

class AmbitoScraper {
  constructor() {
    this.source = 'https://www.ambito.com/contenidos/dolar.html';
    this.name = 'Ambito';
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
      
      // Ambito shows "Dólar oficial" in a specific data-indice section
      let buyPrice = null;
      let sellPrice = null;

      // Try to find the official dollar quote
      $('div[data-indice="dolar oficial"]').each((i, elem) => {
        const compra = $(elem).find('.data-compra').text().trim();
        const venta = $(elem).find('.data-venta').text().trim();
        
        if (compra && venta) {
          buyPrice = parseFloat(compra.replace(',', '.'));
          sellPrice = parseFloat(venta.replace(',', '.'));
        }
      });

      // Fallback: Try alternative selectors
      if (!buyPrice || !sellPrice) {
        $('.data-item').each((i, elem) => {
          const title = $(elem).find('.title').text().trim().toLowerCase();
          if (title.includes('oficial') || title.includes('dólar')) {
            const values = $(elem).find('.value');
            if (values.length >= 2) {
              buyPrice = parseFloat($(values[0]).text().replace(',', '.'));
              sellPrice = parseFloat($(values[1]).text().replace(',', '.'));
            }
          }
        });
      }

      if (!buyPrice || !sellPrice || isNaN(buyPrice) || isNaN(sellPrice)) {
        throw new Error('Could not parse price data from Ambito');
      }

      logger.debug(`${this.name} - Buy: ${buyPrice}, Sell: ${sellPrice}`);

      return {
        buy_price: buyPrice,
        sell_price: sellPrice,
        source: this.source,
      };
    } catch (error) {
      logger.error(`${this.name} scraper error:`, error.message);
      throw error;
    }
  }
}

module.exports = new AmbitoScraper();

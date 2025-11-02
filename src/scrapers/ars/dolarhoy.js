const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../../config/config');
const logger = require('../../utils/logger');

class DolarHoyScraper {
  constructor() {
    this.source = 'https://www.dolarhoy.com';
    this.name = 'DolarHoy';
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

      // DolarHoy shows "Dólar Oficial" in specific divs
      $('.tile').each((i, elem) => {
        const title = $(elem).find('.title').text().trim().toLowerCase();
        
        if (title.includes('oficial')) {
          const values = $(elem).find('.value');
          const compraText = $(elem).find('.compra .val').text().trim();
          const ventaText = $(elem).find('.venta .val').text().trim();
          
          if (compraText && ventaText) {
            buyPrice = parseFloat(compraText.replace('$', '').replace(',', '.'));
            sellPrice = parseFloat(ventaText.replace('$', '').replace(',', '.'));
          }
        }
      });

      if (!buyPrice || !sellPrice || isNaN(buyPrice) || isNaN(sellPrice)) {
        throw new Error('Could not parse price data from DolarHoy');
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

module.exports = new DolarHoyScraper();

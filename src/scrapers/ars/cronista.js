const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../../config/config');
const logger = require('../../utils/logger');

class CronistaScraper {
  constructor() {
    this.source = 'https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB';
    this.name = 'Cronista';
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

      // Cronista shows buy/sell prices in specific elements
      const buyElement = $('.buy-value, .compra').first();
      const sellElement = $('.sell-value, .venta').first();
      
      if (buyElement.length && sellElement.length) {
        const buyText = buyElement.text().trim();
        const sellText = sellElement.text().trim();
        
        buyPrice = parseFloat(buyText.replace('$', '').replace(',', '.'));
        sellPrice = parseFloat(sellText.replace('$', '').replace(',', '.'));
      }

      // Alternative: Look for table data
      if (!buyPrice || !sellPrice) {
        $('table tr').each((i, row) => {
          const cells = $(row).find('td');
          if (cells.length >= 2) {
            const firstCell = $(cells[0]).text().trim();
            if (firstCell.toLowerCase().includes('compra') || i === 0) {
              buyPrice = parseFloat($(cells[0]).text().replace(/[^0-9.,]/g, '').replace(',', '.'));
              sellPrice = parseFloat($(cells[1]).text().replace(/[^0-9.,]/g, '').replace(',', '.'));
            }
          }
        });
      }

      if (!buyPrice || !sellPrice || isNaN(buyPrice) || isNaN(sellPrice)) {
        throw new Error('Could not parse price data from Cronista');
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

module.exports = new CronistaScraper();

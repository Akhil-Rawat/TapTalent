const config = require('../config/config');
const logger = require('../utils/logger');

// ARS Scrapers
const ambitoScraper = require('../scrapers/ars/ambito');
const dolarhoyScraper = require('../scrapers/ars/dolarhoy');
const cronistaScraper = require('../scrapers/ars/cronista');

// BRL Scrapers
const wiseScraper = require('../scrapers/brl/wise');
const nubankScraper = require('../scrapers/brl/nubank');
const nomadScraper = require('../scrapers/brl/nomad');

class ScraperService {
  constructor() {
    this.scrapers = this.getScrapersForRegion(config.region);
  }

  getScrapersForRegion(region) {
    if (region === 'ARS') {
      return [ambitoScraper, dolarhoyScraper, cronistaScraper];
    } else if (region === 'BRL') {
      return [wiseScraper, nubankScraper, nomadScraper];
    } else {
      logger.warn(`Unknown region: ${region}, defaulting to ARS`);
      return [ambitoScraper, dolarhoyScraper, cronistaScraper];
    }
  }

  async scrapeAll() {
    logger.info(`Scraping quotes for region: ${config.region}`);
    
    const results = await Promise.allSettled(
      this.scrapers.map(scraper => this.scrapeWithRetry(scraper))
    );

    const quotes = [];
    const errors = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        quotes.push({
          ...result.value,
          timestamp: new Date().toISOString(),
        });
      } else {
        const scraperName = this.scrapers[index].name;
        logger.error(`Failed to scrape ${scraperName}:`, result.reason);
        errors.push({
          scraper: scraperName,
          error: result.reason.message,
        });
      }
    });

    if (quotes.length === 0) {
      throw new Error('All scrapers failed to retrieve data');
    }

    logger.info(`Successfully scraped ${quotes.length}/${this.scrapers.length} sources`);

    return {
      quotes,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async scrapeWithRetry(scraper, retries = 2) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await scraper.scrape();
      } catch (error) {
        logger.warn(`Scraper ${scraper.name} attempt ${attempt} failed:`, error.message);
        
        if (attempt === retries) {
          throw error;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  changeRegion(newRegion) {
    if (newRegion !== 'ARS' && newRegion !== 'BRL') {
      throw new Error('Invalid region. Must be ARS or BRL');
    }
    
    this.scrapers = this.getScrapersForRegion(newRegion);
    logger.info(`Scrapers updated for region: ${newRegion}`);
  }
}

module.exports = new ScraperService();

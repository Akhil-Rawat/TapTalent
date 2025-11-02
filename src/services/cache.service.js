const NodeCache = require('node-cache');
const config = require('../config/config');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: config.cache.ttl,
      checkperiod: 10,
      useClones: false,
    });

    this.cache.on('expired', (key, value) => {
      logger.debug(`Cache expired for key: ${key}`);
    });
  }

  get(key) {
    const value = this.cache.get(key);
    if (value !== undefined) {
      logger.debug(`Cache hit for key: ${key}`);
    } else {
      logger.debug(`Cache miss for key: ${key}`);
    }
    return value;
  }

  set(key, value, ttl = null) {
    const success = ttl 
      ? this.cache.set(key, value, ttl)
      : this.cache.set(key, value);
    
    if (success) {
      logger.debug(`Cache set for key: ${key}`);
    }
    return success;
  }

  delete(key) {
    return this.cache.del(key);
  }

  flush() {
    this.cache.flushAll();
    logger.debug('Cache flushed');
  }

  getStats() {
    return this.cache.getStats();
  }
}

module.exports = new CacheService();

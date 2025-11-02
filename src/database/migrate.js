const db = require('./db');
const logger = require('../utils/logger');

async function migrate() {
  try {
    await db.connect();

    // Create quotes table
    await db.run(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        region TEXT NOT NULL,
        source TEXT NOT NULL,
        buy_price REAL NOT NULL,
        sell_price REAL NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index for faster queries
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_quotes_region_timestamp 
      ON quotes(region, timestamp DESC)
    `);

    logger.info('Database migration completed successfully');
    
    if (require.main === module) {
      await db.close();
      process.exit(0);
    }
  } catch (error) {
    logger.error('Migration failed:', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
}

if (require.main === module) {
  migrate();
}

module.exports = { migrate };

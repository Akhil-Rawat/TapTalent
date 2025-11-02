// server.js - Simple Currency Exchange API
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup (SQLite)
const db = new sqlite3.Database('./quotes.db');

// Initialize database
db.run(`
  CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    buy_price REAL,
    sell_price REAL,
    region TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Cache configuration
const CACHE_DURATION = 60 * 1000; // 60 seconds
let cachedQuotes = null;
let lastFetchTime = null;

// Region from environment variable
const REGION = process.env.REGION || 'ARS'; // ARS or BRL

// ============= ARS Scrapers =============

async function scrapeAmbito() {
  try {
    const response = await axios.get('https://www.ambito.com/contenidos/dolar.html', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });
    const $ = cheerio.load(response.data);
    
    let buyPrice = null;
    let sellPrice = null;
    
    // Try to find Dolar oficial
    $('div[data-indice="dolar oficial"]').each((i, elem) => {
      const compra = $(elem).find('.data-compra').text().trim();
      const venta = $(elem).find('.data-venta').text().trim();
      if (compra && venta) {
        buyPrice = parseFloat(compra.replace(',', '.'));
        sellPrice = parseFloat(venta.replace(',', '.'));
      }
    });
    
    if (!buyPrice || !sellPrice) {
      $('.data-item').each((i, elem) => {
        const title = $(elem).find('.title').text().trim().toLowerCase();
        if (title.includes('oficial')) {
          const values = $(elem).find('.value');
          if (values.length >= 2) {
            buyPrice = parseFloat($(values[0]).text().replace(',', '.'));
            sellPrice = parseFloat($(values[1]).text().replace(',', '.'));
          }
        }
      });
    }
    
    return buyPrice && sellPrice ? {
      buy_price: buyPrice,
      sell_price: sellPrice,
      source: 'https://www.ambito.com/contenidos/dolar.html'
    } : null;
  } catch (error) {
    console.error('Ambito error:', error.message);
    return null;
  }
}

async function scrapeDolarHoy() {
  try {
    const response = await axios.get('https://www.dolarhoy.com', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });
    const $ = cheerio.load(response.data);
    
    let buyPrice = null;
    let sellPrice = null;
    
    $('.tile').each((i, elem) => {
      const title = $(elem).find('.title').text().trim().toLowerCase();
      if (title.includes('oficial')) {
        const compraText = $(elem).find('.compra .val').text().trim();
        const ventaText = $(elem).find('.venta .val').text().trim();
        
        if (compraText && ventaText) {
          buyPrice = parseFloat(compraText.replace('$', '').replace(',', '.'));
          sellPrice = parseFloat(ventaText.replace('$', '').replace(',', '.'));
        }
      }
    });
    
    return buyPrice && sellPrice ? {
      buy_price: buyPrice,
      sell_price: sellPrice,
      source: 'https://www.dolarhoy.com'
    } : null;
  } catch (error) {
    console.error('DolarHoy error:', error.message);
    return null;
  }
}

async function scrapeCronista() {
  try {
    const response = await axios.get('https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });
    const $ = cheerio.load(response.data);
    
    let buyPrice = null;
    let sellPrice = null;
    
    const buyElement = $('.buy-value, .compra').first();
    const sellElement = $('.sell-value, .venta').first();
    
    if (buyElement.length && sellElement.length) {
      buyPrice = parseFloat(buyElement.text().replace('$', '').replace(',', '.'));
      sellPrice = parseFloat(sellElement.text().replace('$', '').replace(',', '.'));
    }
    
    return buyPrice && sellPrice ? {
      buy_price: buyPrice,
      sell_price: sellPrice,
      source: 'https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB'
    } : null;
  } catch (error) {
    console.error('Cronista error:', error.message);
    return null;
  }
}

// ============= BRL Scrapers =============

async function scrapeWise() {
  try {
    const response = await axios.get('https://wise.com/es/currency-converter/brl-to-usd-rate', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });
    const $ = cheerio.load(response.data);
    
    let rate = null;
    const rateText = $('.text-success, .cc__source-to-target__rate').first().text().trim();
    
    if (rateText) {
      const matches = rateText.match(/[\d.,]+/g);
      if (matches && matches.length >= 2) {
        rate = parseFloat(matches[1].replace(',', '.'));
      }
    }
    
    if (rate && rate < 1) {
      rate = 1 / rate; // Convert BRL->USD to USD->BRL
    }
    
    const spread = 0.02; // 2% spread estimate
    return rate ? {
      buy_price: parseFloat((rate * (1 - spread)).toFixed(4)),
      sell_price: parseFloat((rate * (1 + spread)).toFixed(4)),
      source: 'https://wise.com/es/currency-converter/brl-to-usd-rate'
    } : null;
  } catch (error) {
    console.error('Wise error:', error.message);
    return null;
  }
}

async function scrapeNubank() {
  try {
    const response = await axios.get('https://nubank.com.br/taxas-conversao/', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });
    const $ = cheerio.load(response.data);
    
    let buyPrice = null;
    let sellPrice = null;
    
    $('table tr, .rate-item').each((i, elem) => {
      const text = $(elem).text().toLowerCase();
      if (text.includes('dólar') || text.includes('usd')) {
        const values = $(elem).find('td, .value');
        values.each((j, val) => {
          const parsed = parseFloat($(val).text().replace(',', '.').replace(/[^0-9.]/g, ''));
          if (!isNaN(parsed) && parsed > 1 && parsed < 10) {
            if (!buyPrice) buyPrice = parsed;
            else if (!sellPrice) sellPrice = parsed;
          }
        });
      }
    });
    
    if (buyPrice && !sellPrice) sellPrice = buyPrice * 1.04;
    if (sellPrice && !buyPrice) buyPrice = sellPrice * 0.96;
    
    return buyPrice && sellPrice ? {
      buy_price: parseFloat(buyPrice.toFixed(4)),
      sell_price: parseFloat(sellPrice.toFixed(4)),
      source: 'https://nubank.com.br/taxas-conversao/'
    } : null;
  } catch (error) {
    console.error('Nubank error:', error.message);
    return null;
  }
}

async function scrapeNomad() {
  try {
    const response = await axios.get('https://www.nomadglobal.com', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });
    const $ = cheerio.load(response.data);
    
    let buyPrice = null;
    let sellPrice = null;
    
    $('.exchange-rate, .rate-display').each((i, elem) => {
      const parsed = parseFloat($(elem).text().replace(',', '.').replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed) && parsed > 1 && parsed < 10) {
        if (!buyPrice) buyPrice = parsed;
        else if (!sellPrice) sellPrice = parsed;
      }
    });
    
    if (buyPrice && !sellPrice) sellPrice = buyPrice * 1.03;
    if (sellPrice && !buyPrice) buyPrice = sellPrice * 0.97;
    
    return buyPrice && sellPrice ? {
      buy_price: parseFloat(buyPrice.toFixed(4)),
      sell_price: parseFloat(sellPrice.toFixed(4)),
      source: 'https://www.nomadglobal.com'
    } : null;
  } catch (error) {
    console.error('Nomad error:', error.message);
    return null;
  }
}

// ============= Core Functions =============

async function fetchQuotes() {
  let scrapers;
  
  if (REGION === 'BRL') {
    scrapers = [scrapeWise, scrapeNubank, scrapeNomad];
  } else {
    scrapers = [scrapeAmbito, scrapeDolarHoy, scrapeCronista];
  }
  
  const results = await Promise.all(scrapers.map(scraper => scraper()));
  const validQuotes = results.filter(q => q && q.buy_price && q.sell_price);
  
  // Save to database
  for (const quote of validQuotes) {
    db.run(
      'INSERT INTO quotes (source, buy_price, sell_price, region) VALUES (?, ?, ?, ?)',
      [quote.source, quote.buy_price, quote.sell_price, REGION]
    );
  }
  
  return validQuotes;
}

async function getQuotes() {
  const now = Date.now();
  
  if (cachedQuotes && lastFetchTime && (now - lastFetchTime) < CACHE_DURATION) {
    console.log('Returning cached quotes');
    return cachedQuotes;
  }
  
  console.log('Fetching fresh quotes...');
  cachedQuotes = await fetchQuotes();
  lastFetchTime = now;
  
  return cachedQuotes;
}

function calculateAverage(quotes) {
  if (quotes.length === 0) {
    return { average_buy_price: 0, average_sell_price: 0 };
  }
  
  const totalBuy = quotes.reduce((sum, q) => sum + q.buy_price, 0);
  const totalSell = quotes.reduce((sum, q) => sum + q.sell_price, 0);
  
  return {
    average_buy_price: parseFloat((totalBuy / quotes.length).toFixed(4)),
    average_sell_price: parseFloat((totalSell / quotes.length).toFixed(4))
  };
}

function calculateSlippage(quotes, average) {
  return quotes.map(quote => {
    const buySlippage = (quote.buy_price - average.average_buy_price) / average.average_buy_price;
    const sellSlippage = (quote.sell_price - average.average_sell_price) / average.average_sell_price;
    
    return {
      buy_price_slippage: parseFloat(buySlippage.toFixed(4)),
      sell_price_slippage: parseFloat(sellSlippage.toFixed(4)),
      source: quote.source
    };
  });
}

// ============= Routes =============

app.get('/', (req, res) => {
  res.json({
    message: 'Currency Exchange API',
    region: REGION,
    endpoints: {
      quotes: '/quotes',
      average: '/average',
      slippage: '/slippage'
    }
  });
});

app.get('/quotes', async (req, res) => {
  try {
    const quotes = await getQuotes();
    res.json(quotes);
  } catch (error) {
    console.error('Error in /quotes:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

app.get('/average', async (req, res) => {
  try {
    const quotes = await getQuotes();
    const average = calculateAverage(quotes);
    res.json(average);
  } catch (error) {
    console.error('Error in /average:', error);
    res.status(500).json({ error: 'Failed to calculate average' });
  }
});

app.get('/slippage', async (req, res) => {
  try {
    const quotes = await getQuotes();
    const average = calculateAverage(quotes);
    const slippage = calculateSlippage(quotes, average);
    res.json(slippage);
  } catch (error) {
    console.error('Error in /slippage:', error);
    res.status(500).json({ error: 'Failed to calculate slippage' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Region: ${REGION}`);
  console.log(`✓ Cache TTL: ${CACHE_DURATION / 1000}s`);
});

# 💱 Currency Exchange Rate API

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A robust, real-time currency exchange rate aggregator that collects USD to ARS/BRL quotes from multiple sources, providing accurate averages and slippage analysis.

> **📝 Assignment Solution**: This project was built as a backend development assignment for an internship. See [SOLUTION_SUMMARY.md](SOLUTION_SUMMARY.md) for details.

## 🌟 Features

- **Multi-Source Aggregation**: Collects rates from 3+ reliable sources
- **Real-Time Data**: Maximum 60-second cache for fresh information
- **Slippage Analysis**: Calculates price differences across sources
- **Regional Support**: Configurable for ARS (Argentina) or BRL (Brazil)
- **Production Ready**: Includes caching, error handling, and logging

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Taptalent

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env to set your REGION (ARS or BRL)

# Initialize database
npm run db:migrate

# Start the server
npm start
```

### Development Mode

```bash
npm run dev
```

## 📡 API Endpoints

### GET `/quotes`

Returns current USD exchange rates from all sources.

**Response:**
```json
[
  {
    "buy_price": 140.3,
    "sell_price": 144.0,
    "source": "https://www.ambito.com/contenidos/dolar.html",
    "timestamp": "2025-10-31T12:00:00.000Z"
  }
]
```

### GET `/average`

Returns the average buy and sell prices across all sources.

**Response:**
```json
{
  "average_buy_price": 142.3,
  "average_sell_price": 147.4,
  "source_count": 3,
  "timestamp": "2025-10-31T12:00:00.000Z"
}
```

### GET `/slippage`

Returns slippage percentage for each source compared to the average.

**Response:**
```json
[
  {
    "buy_price_slippage": 0.04,
    "sell_price_slippage": 0.06,
    "source": "https://www.ambito.com/contenidos/dolar.html",
    "absolute_buy_diff": 2.0,
    "absolute_sell_diff": 3.4
  }
]
```

## 🏗️ Architecture

```
src/
├── index.js              # Application entry point
├── config/               # Configuration management
│   └── config.js
├── scrapers/             # Source-specific scrapers
│   ├── ars/              # Argentine Peso scrapers
│   │   ├── ambito.js
│   │   ├── dolarhoy.js
│   │   └── cronista.js
│   └── brl/              # Brazilian Real scrapers
│       ├── wise.js
│       ├── nubank.js
│       └── nomad.js
├── services/             # Business logic
│   ├── scraper.service.js
│   ├── quote.service.js
│   └── cache.service.js
├── controllers/          # Request handlers
│   └── quote.controller.js
├── routes/               # API routes
│   └── quote.routes.js
├── database/             # Database layer
│   ├── db.js
│   └── migrate.js
├── middleware/           # Express middleware
│   └── errorHandler.js
└── utils/                # Utilities
    └── logger.js
```

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite3
- **Web Scraping**: Axios + Cheerio
- **Caching**: node-cache
- **Security**: Helmet
- **Logging**: Winston

## 🔧 Configuration

Edit `.env` file:

- `REGION`: Set to `ARS` or `BRL` based on your location
- `CACHE_TTL`: Cache time-to-live in seconds (default: 60)
- `PORT`: Server port (default: 3000)

## 📦 Deployment

### Using Docker (Recommended)

```bash
docker build -t currency-exchange-api .
docker run -p 3000:3000 -e REGION=ARS currency-exchange-api
```

### Manual Deployment

1. Set `NODE_ENV=production` in `.env`
2. Run `npm install --production`
3. Run `npm run db:migrate`
4. Run `npm start`

## 📊 Data Freshness

The API ensures data is never older than 60 seconds by:
- Implementing intelligent cache layer
- Automatic background refresh
- Timestamp tracking for all quotes

## 🤝 Contributing

Pull requests are welcome! Please ensure your code follows the existing style.

## 📄 License

MIT License

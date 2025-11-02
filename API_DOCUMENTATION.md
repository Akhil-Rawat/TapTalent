# API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
No authentication required for this version.

---

## Endpoints

### 1. Health Check
Check if the API is running and healthy.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-10-31T12:00:00.000Z",
  "region": "ARS",
  "uptime": 123.456
}
```

---

### 2. Get Quotes
Retrieve current USD exchange rates from all sources.

**Endpoint:** `GET /quotes`

**Query Parameters:**
- `refresh` (optional): Set to `true` to bypass cache and fetch fresh data

**Example Request:**
```bash
curl http://localhost:3000/quotes
curl http://localhost:3000/quotes?refresh=true
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "buy_price": 140.3,
      "sell_price": 144.0,
      "source": "https://www.ambito.com/contenidos/dolar.html",
      "timestamp": "2025-10-31T12:00:00.000Z"
    },
    {
      "buy_price": 141.5,
      "sell_price": 145.2,
      "source": "https://www.dolarhoy.com",
      "timestamp": "2025-10-31T12:00:00.000Z"
    },
    {
      "buy_price": 142.0,
      "sell_price": 146.8,
      "source": "https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB",
      "timestamp": "2025-10-31T12:00:00.000Z"
    }
  ],
  "count": 3
}
```

**Response Fields:**
- `buy_price`: Price at which the source buys USD
- `sell_price`: Price at which the source sells USD
- `source`: URL of the data source
- `timestamp`: When the data was retrieved

---

### 3. Get Average
Get the average buy and sell prices across all sources.

**Endpoint:** `GET /average`

**Query Parameters:**
- `refresh` (optional): Set to `true` to bypass cache and fetch fresh data

**Example Request:**
```bash
curl http://localhost:3000/average
```

**Response:**
```json
{
  "success": true,
  "data": {
    "average_buy_price": 141.2667,
    "average_sell_price": 145.3333,
    "source_count": 3,
    "timestamp": "2025-10-31T12:00:00.000Z"
  }
}
```

**Response Fields:**
- `average_buy_price`: Mean of all buy prices
- `average_sell_price`: Mean of all sell prices
- `source_count`: Number of sources used in calculation
- `timestamp`: When the calculation was performed

---

### 4. Get Slippage
Get slippage analysis showing how each source deviates from the average.

**Endpoint:** `GET /slippage`

**Query Parameters:**
- `refresh` (optional): Set to `true` to bypass cache and fetch fresh data

**Example Request:**
```bash
curl http://localhost:3000/slippage
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "buy_price_slippage": -0.0068,
      "sell_price_slippage": -0.0092,
      "absolute_buy_diff": -0.9667,
      "absolute_sell_diff": -1.3333,
      "source": "https://www.ambito.com/contenidos/dolar.html",
      "timestamp": "2025-10-31T12:00:00.000Z"
    },
    {
      "buy_price_slippage": 0.0016,
      "sell_price_slippage": -0.0009,
      "absolute_buy_diff": 0.2333,
      "absolute_sell_diff": -0.1333,
      "source": "https://www.dolarhoy.com",
      "timestamp": "2025-10-31T12:00:00.000Z"
    },
    {
      "buy_price_slippage": 0.0052,
      "sell_price_slippage": 0.0101,
      "absolute_buy_diff": 0.7333,
      "absolute_sell_diff": 1.4667,
      "source": "https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB",
      "timestamp": "2025-10-31T12:00:00.000Z"
    }
  ],
  "count": 3
}
```

**Response Fields:**
- `buy_price_slippage`: Percentage difference from average buy price (e.g., 0.04 = 4%)
- `sell_price_slippage`: Percentage difference from average sell price
- `absolute_buy_diff`: Absolute difference from average buy price
- `absolute_sell_diff`: Absolute difference from average sell price
- `source`: URL of the data source
- `timestamp`: When the data was retrieved

**Understanding Slippage:**
- Positive slippage: Source price is higher than average
- Negative slippage: Source price is lower than average
- Formula: `(source_price - average_price) / average_price`

---

### 5. Get Historical Data
Retrieve historical quotes from the database.

**Endpoint:** `GET /historical`

**Query Parameters:**
- `limit` (optional): Number of records to retrieve (default: 100, max: 1000)

**Example Request:**
```bash
curl http://localhost:3000/historical
curl http://localhost:3000/historical?limit=50
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "region": "ARS",
      "source": "https://www.ambito.com/contenidos/dolar.html",
      "buy_price": 140.3,
      "sell_price": 144.0,
      "timestamp": "2025-10-31T12:00:00.000Z",
      "created_at": "2025-10-31T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "message": "Error description here"
  }
}
```

**Common HTTP Status Codes:**
- `200 OK`: Request successful
- `404 Not Found`: Endpoint does not exist
- `500 Internal Server Error`: Server-side error (e.g., all scrapers failed)

---

## Caching

- All data is cached for **60 seconds** by default
- Use `?refresh=true` to bypass cache and get fresh data
- Cache ensures the "max 60s old data" requirement is met

---

## Rate Limiting

Currently no rate limiting is enforced, but it can be added for production use.

---

## Region Configuration

The API supports two regions:
- **ARS**: Argentine Peso (sources: Ambito, DolarHoy, Cronista)
- **BRL**: Brazilian Real (sources: Wise, Nubank, Nomad)

Configure region in `.env` file:
```
REGION=ARS
```

---

## Example Usage (JavaScript)

```javascript
// Get quotes
fetch('http://localhost:3000/quotes')
  .then(res => res.json())
  .then(data => console.log(data));

// Get average
fetch('http://localhost:3000/average')
  .then(res => res.json())
  .then(data => console.log(data));

// Get slippage
fetch('http://localhost:3000/slippage')
  .then(res => res.json())
  .then(data => console.log(data));

// Force refresh
fetch('http://localhost:3000/quotes?refresh=true')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## Testing with curl

```bash
# Test all endpoints
curl http://localhost:3000/health
curl http://localhost:3000/quotes
curl http://localhost:3000/average
curl http://localhost:3000/slippage
curl http://localhost:3000/historical?limit=10

# Force refresh
curl http://localhost:3000/quotes?refresh=true
```

---

## Notes

1. **Web Scraping Reliability**: Some sources may occasionally fail. The API continues to work with available sources.
2. **Data Freshness**: Maximum 60 seconds old (configurable via CACHE_TTL)
3. **Concurrent Requests**: All scrapers run in parallel for better performance
4. **Database**: Stores historical data for analysis and tracking

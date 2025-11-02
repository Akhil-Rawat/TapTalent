# Project Structure

```
Taptalent/
├── src/
│   ├── config/
│   │   └── config.js              # Application configuration
│   ├── controllers/
│   │   └── quote.controller.js    # Request handlers
│   ├── database/
│   │   ├── db.js                  # Database connection
│   │   └── migrate.js             # Database migrations
│   ├── middleware/
│   │   └── errorHandler.js        # Error handling middleware
│   ├── routes/
│   │   └── quote.routes.js        # API route definitions
│   ├── scrapers/
│   │   ├── ars/                   # Argentine Peso scrapers
│   │   │   ├── ambito.js
│   │   │   ├── dolarhoy.js
│   │   │   └── cronista.js
│   │   └── brl/                   # Brazilian Real scrapers
│   │       ├── wise.js
│   │       ├── nubank.js
│   │       └── nomad.js
│   ├── services/
│   │   ├── cache.service.js       # Caching logic
│   │   ├── quote.service.js       # Business logic
│   │   └── scraper.service.js     # Scraping orchestration
│   ├── utils/
│   │   └── logger.js              # Logging utility
│   └── index.js                   # Application entry point
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI/CD
├── data/                          # SQLite database storage
├── .env                           # Environment variables
├── .env.example                   # Environment template
├── .gitignore                     # Git ignore rules
├── package.json                   # Project dependencies
├── Dockerfile                     # Docker configuration
├── docker-compose.yml             # Docker Compose setup
├── README.md                      # Main documentation
├── API_DOCUMENTATION.md           # API reference
├── DEPLOYMENT.md                  # Deployment guide
└── test-api.sh                    # API testing script
```

## Key Design Patterns

### 1. **Layered Architecture**
- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Scrapers**: Data collection from external sources
- **Database**: Data persistence layer

### 2. **Service Layer Pattern**
- `scraper.service.js`: Orchestrates multiple scrapers
- `quote.service.js`: Handles quote calculations
- `cache.service.js`: Manages caching strategy

### 3. **Strategy Pattern**
- Different scrapers for different regions
- Scrapers can be swapped without changing core logic

### 4. **Repository Pattern**
- Database operations abstracted in `db.js`
- Easy to switch database systems

### 5. **Error Handling**
- Centralized error middleware
- Graceful degradation (continues with available scrapers)
- Retry logic with exponential backoff

## Data Flow

```
1. Client Request
   ↓
2. Express Router (quote.routes.js)
   ↓
3. Controller (quote.controller.js)
   ↓
4. Service Layer (quote.service.js)
   ↓
5. Cache Check (cache.service.js)
   ↓
6. Scraper Service (scraper.service.js)
   ↓
7. Individual Scrapers (ambito.js, etc.)
   ↓
8. Database Storage (db.js)
   ↓
9. Response to Client
```

## Unique Features

### 1. **Intelligent Caching**
- Node-cache with configurable TTL
- Ensures data is never older than 60 seconds
- Reduces load on external sources

### 2. **Parallel Scraping**
- All sources scraped concurrently using `Promise.allSettled`
- Faster response times
- Fault-tolerant (one failure doesn't affect others)

### 3. **Retry Mechanism**
- Automatic retries with exponential backoff
- Increases reliability

### 4. **Historical Data**
- All quotes saved to database
- Useful for trend analysis
- Separate `/historical` endpoint

### 5. **Region Support**
- Easy switching between ARS and BRL
- Configurable via environment variable
- Extensible to add more regions

### 6. **Production-Ready**
- Helmet.js for security
- Winston for professional logging
- Graceful shutdown handling
- Health check endpoint
- Docker support

### 7. **Clean Code Principles**
- Single Responsibility Principle
- DRY (Don't Repeat Yourself)
- Clear separation of concerns
- Comprehensive error handling
- Consistent naming conventions

## Configuration Management

All configuration centralized in:
- `src/config/config.js`: Loads from environment
- `.env`: Environment-specific settings
- Validates configuration on startup

## Logging Strategy

Using Winston with:
- File logging (error.log, combined.log)
- Console logging in development
- Structured JSON logs
- Different log levels (error, warn, info, debug)

## Security Measures

1. **Helmet.js**: Sets security headers
2. **CORS**: Configured for cross-origin requests
3. **No sensitive data exposure**: Errors don't leak stack traces in production
4. **Environment variables**: Secrets not hardcoded
5. **Input validation**: Query parameters validated

## Scalability Considerations

- **Stateless design**: Can run multiple instances
- **Cache separation**: Can use Redis for distributed cache
- **Database**: SQLite can be replaced with PostgreSQL
- **Load balancing ready**: No sticky sessions required

## Testing Strategy

- Manual testing script (`test-api.sh`)
- Health check endpoint for monitoring
- CI/CD pipeline with GitHub Actions
- Docker smoke tests

## Monitoring & Observability

- Structured logging with Winston
- Health check endpoint
- Cache statistics available
- Database query logging in debug mode

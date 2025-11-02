# Currency Exchange API

Backend assignment - USD to ARS/BRL exchange rates.

## Setup

```bash
npm install
npm start
```

Server: `http://localhost:3000`

## Endpoints

- `GET /quotes` - Current rates from all sources
- `GET /average` - Average prices  
- `GET /slippage` - Slippage per source

## Config

`.env`:
```
PORT=3000
REGION=ARS
```

Change to `REGION=BRL` for Brazil.

## Tech

Node.js, Express, Axios, Cheerio, SQLite

## Sources

**ARS**: Ambito, DolarHoy, Cronista  
**BRL**: Wise, Nubank, Nomad

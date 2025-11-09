# Quick Start Guide

## Prerequisites
- Node.js 18+ and npm
- PostgreSQL 15+ (or Docker)

## Quick Setup (5 minutes)

### Option 1: Using Docker (Recommended)

```bash
# Start PostgreSQL and API
docker-compose up -d

# View logs
docker-compose logs -f app

# Access API
# http://localhost:3000
# Swagger: http://localhost:3000/api
```

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Set up environment (copy and edit if needed)
cp .env.example .env

# Start PostgreSQL (if not running)
# Create database: createdb ecoratings

# Run the application
npm run start:dev

# Access API
# http://localhost:3000
# Swagger: http://localhost:3000/api
```

## First Steps

1. **Create an Organization**
   ```bash
   curl -X POST http://localhost:3000/organizations \
     -H "Content-Type: application/json" \
     -d '{"name": "My Company", "description": "Test organization"}'
   ```

2. **Create a Facility**
   ```bash
   curl -X POST http://localhost:3000/facilities \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Main Office",
       "region": "North America",
       "organizationId": "<org-id-from-step-1>"
     }'
   ```

3. **Upload Electricity Usage**
   ```bash
   curl -X POST http://localhost:3000/electricity-usage \
     -H "Content-Type: application/json" \
     -d '{
       "facilityId": "<facility-id-from-step-2>",
       "year": 2024,
       "month": 3,
       "consumptionKwh": 15000
     }'
   ```

4. **View Emissions Summary**
   ```bash
   curl http://localhost:3000/emissions/summary
   ```

## Testing

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:cov
```

## Health Check

```bash
# Basic health check
curl http://localhost:3000/health

# Detailed metrics
curl http://localhost:3000/health/metrics
```

## Swagger Documentation

Visit http://localhost:3000/api for interactive API documentation.

## Need Help?

See the full [README.md](README.md) for detailed documentation.


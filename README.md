# EcoRatings - Scope 2 GHG Emissions Tracking Service

A comprehensive backend service built with NestJS that helps organizations track and automate their Scope 2 greenhouse gas (GHG) emissions resulting from purchased electricity consumption. The service provides automated emissions calculations, data quality checks, anomaly detection, and comprehensive reporting capabilities.

## Table of Contents

- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Data Model](#data-model)
- [Setup and Installation](#setup-and-installation)
- [API Documentation](#api-documentation)
- [Calculation Logic](#calculation-logic)
- [Anomaly Detection](#anomaly-detection)
- [Scaling Considerations](#scaling-considerations)
- [Logging](#logging)
- [Monitoring](#monitoring)
- [AWS Deployment](#aws-deployment)
- [Testing](#testing)
- [License](#license)

## Features

- **Organization & Facility Management**: Register organizations and their facilities with regional information
- **Electricity Usage Tracking**: Upload monthly electricity consumption data per facility
- **Automated Emissions Calculation**: Automatic calculation using regional grid emission factors
- **Data Quality Checks**: Validation for missing data, duplicates, and abnormal patterns
- **Anomaly Detection**: Intelligent detection of data spikes and missing consecutive months
- **Idempotent Uploads**: Prevent duplicate data uploads using upload IDs
- **Emission Factor Management**: Store and manage grid emission factors by region and year
- **Comprehensive Reporting**: Generate summaries by organization, facility, and time period
- **Health Checks & Metrics**: Monitor service health and track key metrics
- **RESTful API**: Well-documented API with Swagger/OpenAPI integration

## Architecture Overview

The service follows a modular architecture using NestJS framework with the following key components:

### Technology Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with TypeORM
- **Language**: TypeScript
- **API Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose

### Module Structure

```
src/
├── organizations/          # Organization management
├── facilities/             # Facility management
├── electricity-usage/     # Electricity consumption data
├── emission-factors/      # Grid emission factors management
├── emissions/             # Emissions calculation and reporting
└── health/                # Health checks and metrics
```

### Key Design Patterns

- **Repository Pattern**: TypeORM repositories for data access
- **Service Layer**: Business logic separated from controllers
- **DTO Pattern**: Data Transfer Objects for request/response validation
- **Dependency Injection**: NestJS built-in DI container
- **Modular Design**: Feature-based module organization

## Data Model

### Entities

#### Organization
- `id` (UUID): Primary key
- `name` (string): Unique organization name
- `description` (string, optional): Organization description
- `createdAt`, `updatedAt`: Timestamps

#### Facility
- `id` (UUID): Primary key
- `name` (string): Facility name
- `region` (string): Geographic region (used for emission factor lookup)
- `address` (string, optional): Physical address
- `country` (string, optional): Country code
- `timezone` (string, optional): Timezone
- `organizationId` (UUID): Foreign key to Organization
- `createdAt`, `updatedAt`: Timestamps

#### ElectricityUsage
- `id` (UUID): Primary key
- `facilityId` (UUID): Foreign key to Facility
- `year` (integer): Year of consumption
- `month` (integer, 1-12): Month of consumption
- `consumptionKwh` (decimal): Electricity consumption in kWh
- `calculatedEmissions` (decimal): Calculated CO2 emissions in kg
- `emissionFactorUsed` (string): Identifier of emission factor used
- `hasAnomaly` (boolean): Flag indicating data anomaly
- `anomalyReason` (text): Description of anomaly if detected
- `uploadId` (string, unique): Idempotency key for uploads
- `createdAt`, `updatedAt`: Timestamps
- **Unique Constraint**: (facilityId, year, month)

#### EmissionFactor
- `id` (UUID): Primary key
- `region` (string): Geographic region
- `year` (integer): Year the factor applies to
- `factorKgCo2PerKwh` (decimal): Emission factor in kg CO2 per kWh
- `source` (string, optional): Source of the emission factor
- `notes` (text, optional): Additional notes
- `isActive` (boolean): Soft delete flag
- `createdAt`, `updatedAt`: Timestamps
- **Unique Constraint**: (region, year)

### Relationships

- Organization → Facilities (One-to-Many)
- Facility → ElectricityUsage (One-to-Many)
- Facility → Organization (Many-to-One)

## Setup and Installation

### Prerequisites

- **Node.js 18+** and npm (for local development)
- **PostgreSQL 15+** (or use Docker)
- **Docker Desktop** (for containerized setup - recommended)

### Quick Start with Docker (Recommended)

This is the easiest way to get started. Docker will handle both the database and application setup.

#### Step 1: Install Docker Desktop

**macOS:**
```bash
# Using Homebrew
brew install --cask docker

# Or download from: https://www.docker.com/products/docker-desktop/
```

**Windows/Linux:**
- Download from: https://www.docker.com/products/docker-desktop/
- Follow installation wizard
- Start Docker Desktop application

**Verify Installation:**
```bash
docker --version
# Should output: Docker version 24.x.x or similar
```

#### Step 2: Start Docker Desktop

Make sure Docker Desktop is running before proceeding. You should see the Docker icon in your system tray/menu bar.

**Verify Docker is running:**
```bash
docker ps
# Should show an empty list (no errors)
```

#### Step 3: Clone and Navigate to Project

```bash
git clone https://github.com/KashishBagga/ecoratings
```

#### Step 4: Start Services with Docker Compose

```bash
# Start both database and API
docker-compose up

# Or run in background (detached mode)
docker-compose up -d
```

This will:
- Pull PostgreSQL 15 image (first time only)
- Build the EcoRatings application image
- Start both containers
- Set up database connection automatically

**Expected Output:**
```
✔ Network ecoratings_default       Created
✔ Volume ecoratings_postgres_data  Created
✔ Container ecoratings-db          Created
✔ Container ecoratings-api         Created
[+] Running 2/2
✔ Container ecoratings-db          Started
✔ Container ecoratings-api         Started
```

#### Step 5: Verify Application is Running

Wait about 10-15 seconds for the application to start, then check:

```bash
# View application logs
docker-compose logs -f app

# Or check health endpoint
curl http://localhost:3000/health
```

You should see:
- Database connection successful
- Application started on port 3000
- Swagger documentation available

#### Step 6: Access the Application

- **API Base URL:** http://localhost:3000
- **Swagger Documentation:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/health
- **Metrics:** http://localhost:3000/health/metrics

#### Docker Commands Reference

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f app          # Application logs
docker-compose logs -f postgres     # Database logs
docker-compose logs -f              # All logs

# Stop services
docker-compose down

# Stop and remove volumes (deletes database data)
docker-compose down -v

# Rebuild after code changes
docker-compose up --build

# Restart a specific service
docker-compose restart app
```

### Local Development Setup (Without Docker)

If you prefer to run the application locally without Docker:

#### Step 1: Install Prerequisites

**Install Node.js:**
```bash
# Using Homebrew (macOS)
brew install node@18

# Or download from: https://nodejs.org/
```

**Install PostgreSQL:**
```bash
# macOS with Homebrew
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb ecoratings
```

See [SETUP_DATABASE.md](SETUP_DATABASE.md) for detailed database setup instructions.

#### Step 2: Clone and Install Dependencies

```bash
git clone <repository-url>
cd EcoRatings
npm install
```

#### Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Copy example (if exists)
cp .env.example .env

# Or create manually
cat > .env << EOF
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=ecoratings
NODE_ENV=development
LOG_LEVEL=INFO
PORT=3000
EOF
```

**Important:** Update the database credentials to match your PostgreSQL setup.

#### Step 4: Run Database Migrations

The application uses TypeORM's `synchronize` option in development mode, which automatically creates/updates database tables. For production, use migrations.

#### Step 5: Start the Application

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

#### Step 6: Verify Installation

```bash
# Check health
curl http://localhost:3000/health

# Should return:
# {"status":"healthy","timestamp":"2024-..."}
```

### Building Docker Image Manually

If you want to build the Docker image separately:

```bash
# Build the image
docker build -t ecoratings:latest .

# Verify image was created
docker images | grep ecoratings

# Run the container (requires database)
docker run -p 3000:3000 \
  -e DATABASE_HOST=host.docker.internal \
  -e DATABASE_PORT=5432 \
  -e DATABASE_USER=postgres \
  -e DATABASE_PASSWORD=postgres \
  -e DATABASE_NAME=ecoratings \
  ecoratings:latest
```

### Initial Data

The service automatically loads emission factors from `data/emission-factors.json` on startup. You can also add factors via the API.

**Pre-loaded Emission Factors:**
- Automatically imported from `data/emission-factors.json`
- Includes factors for various regions and years
- Can be managed via `/emission-factors` API endpoints

### Troubleshooting

#### Docker Issues

**Problem: "Cannot connect to Docker daemon"**
```bash
# Solution: Start Docker Desktop
open -a Docker  # macOS
# Or launch Docker Desktop from Applications
```

**Problem: "nest: not found" error in docker-compose**
- ✅ **Fixed:** The docker-compose.yml now uses `start:prod` instead of `start:dev`
- If you still see this, rebuild: `docker-compose up --build`

**Problem: Port 3000 already in use**
```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process or use a different port
# Edit docker-compose.yml: change "3000:3000" to "3001:3000"
```

#### Database Connection Issues

**Problem: "Unable to connect to the database"**
```bash
# Check if database container is running
docker-compose ps

# Check database logs
docker-compose logs postgres

# Verify database is ready
docker-compose exec postgres pg_isready -U postgres
```

**Problem: Database connection refused in standalone container**
- Make sure database is running first
- Use `host.docker.internal` for localhost connections
- Or use docker network: `--network ecoratings_default`

#### Application Issues

**Problem: Application won't start**
```bash
# Check logs
docker-compose logs app

# Rebuild image
docker-compose up --build

# Check environment variables
docker-compose exec app env | grep DATABASE
```

**Problem: TypeORM synchronization errors**
- Check database user has CREATE TABLE permissions
- Verify database name is correct
- Check for existing tables with conflicting names

### Next Steps

After successful setup:

1. **Explore API Documentation**
   - Visit http://localhost:3000/api
   - Interactive Swagger UI with all endpoints

2. **Create Your First Data**
   - See [QUICKSTART.md](QUICKSTART.md) for step-by-step examples
   - Or use the Swagger UI to test endpoints

3. **Check Health and Metrics**
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3000/health/metrics
   ```

4. **Review API Endpoints**
   - See [API Documentation](#api-documentation) section below
   - All endpoints are documented in Swagger UI

## API Documentation

### Base URL
```
http://localhost:3000
```

### Swagger UI
Interactive API documentation is available at:
```
http://localhost:3000/api
```

### Key Endpoints

#### Organizations
- `POST /organizations` - Register a new organization
- `GET /organizations` - List all organizations
- `GET /organizations/:id` - Get organization details
- `PATCH /organizations/:id` - Update organization
- `DELETE /organizations/:id` - Delete organization

#### Facilities
- `POST /facilities` - Register a new facility
- `GET /facilities` - List facilities (optional: `?organizationId=...`)
- `GET /facilities/:id` - Get facility details
- `PATCH /facilities/:id` - Update facility
- `DELETE /facilities/:id` - Delete facility

#### Electricity Usage
- `POST /electricity-usage` - Upload single monthly usage record
- `POST /electricity-usage/bulk` - Bulk upload multiple records
- `GET /electricity-usage` - List usage records (optional: `?facilityId=...&year=...`)
- `GET /electricity-usage/:id` - Get usage record details
- `DELETE /electricity-usage/:id` - Delete usage record
- `PATCH /electricity-usage/recalculate` - Recalculate emissions (optional: `?facilityId=...&year=...`)

#### Emission Factors
- `POST /emission-factors` - Create emission factor
- `GET /emission-factors` - List factors (optional: `?region=...&year=...`)
- `GET /emission-factors/:id` - Get factor details
- `PATCH /emission-factors/:id` - Update factor
- `DELETE /emission-factors/:id` - Soft delete factor

#### Emissions
- `GET /emissions/summary` - Get emissions summary (optional: `?organizationId=...&facilityId=...&year=...`)

#### Health
- `GET /health` - Health check
- `GET /health/metrics` - Service metrics

### Example API Calls

#### 1. Create Organization
```bash
curl -X POST http://localhost:3000/organizations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "description": "Leading manufacturing company"
  }'
```

#### 2. Create Facility
```bash
curl -X POST http://localhost:3000/facilities \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Manufacturing Plant A",
    "region": "North America",
    "organizationId": "<organization-id>",
    "country": "USA"
  }'
```

#### 3. Upload Electricity Usage
```bash
curl -X POST http://localhost:3000/electricity-usage \
  -H "Content-Type: application/json" \
  -d '{
    "facilityId": "<facility-id>",
    "year": 2024,
    "month": 3,
    "consumptionKwh": 15000.5
  }'
```

#### 4. Bulk Upload
```bash
curl -X POST http://localhost:3000/electricity-usage/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "uploadId": "unique-upload-id-123",
    "data": [
      {
        "facilityId": "<facility-id>",
        "year": 2024,
        "month": 1,
        "consumptionKwh": 12000
      },
      {
        "facilityId": "<facility-id>",
        "year": 2024,
        "month": 2,
        "consumptionKwh": 13500
      }
    ]
  }'
```

#### 5. Get Emissions Summary
```bash
curl http://localhost:3000/emissions/summary?organizationId=<org-id>&year=2024
```

## Calculation Logic

### Emissions Calculation Formula

```
Emissions (kg CO2) = Electricity Consumption (kWh) × Emission Factor (kg CO2/kWh)
```

### Emission Factor Selection

1. **Primary Lookup**: Attempts to find emission factor matching:
   - Facility's region
   - Usage record's year

2. **Fallback Strategy**: If exact match not found:
   - Finds most recent emission factor for the facility's region
   - Uses that factor for calculation

3. **Factor Identification**: Stores the factor identifier as `region-year` (e.g., "North America-2024")

### Recalculation

When emission factors are updated, you can trigger recalculation:
- For all records: `PATCH /electricity-usage/recalculate`
- For specific facility: `PATCH /electricity-usage/recalculate?facilityId=...`
- For specific year: `PATCH /electricity-usage/recalculate?year=2024`

## Anomaly Detection

The service automatically detects data quality issues when uploading electricity usage:

### Detection Rules

1. **Zero/Negative Consumption**
   - Flags records with consumption ≤ 0

2. **Spike Detection**
   - Compares new consumption against historical average (last 12 months)
   - Flags if consumption > 200% of historical average
   - Example: If average is 10,000 kWh, consumption > 20,000 kWh is flagged

3. **Missing Consecutive Months**
   - Checks if previous month has data
   - Flags if gap detected (when historical data exists)

### Anomaly Handling

- Anomalies are detected but **do not prevent** data upload
- `hasAnomaly` flag is set to `true`
- `anomalyReason` contains description of detected issues
- Records are still processed and emissions calculated
- Allows for manual review and correction

## Scaling Considerations

### Database Optimization

1. **Indexing Strategy**
   - Unique index on `(facilityId, year, month)` for fast duplicate detection
   - Index on `uploadId` for idempotency checks
   - Index on `(region, year)` for emission factor lookups
   - Index on `facilityId` for facility-based queries

2. **Query Optimization**
   - Use pagination for large result sets (to be implemented)
   - Batch operations for bulk uploads
   - Connection pooling (TypeORM default)

3. **Partitioning** (Future Enhancement)
   - Partition `electricity_usage` table by year for large datasets
   - Archive old data to separate tables

### Concurrent Uploads

1. **Idempotency**
   - `uploadId` ensures duplicate uploads are rejected
   - Database unique constraint prevents race conditions

2. **Transaction Management**
   - TypeORM transactions for bulk operations
   - Optimistic locking for updates

3. **Rate Limiting** (Future Enhancement)
   - Implement rate limiting middleware
   - Queue system for high-volume uploads (e.g., Bull/BullMQ)

### Horizontal Scaling

1. **Stateless Design**
   - Service is stateless, can run multiple instances
   - Load balancer can distribute requests

2. **Database Scaling**
   - Read replicas for read-heavy workloads
   - Connection pooling per instance
   - Consider read/write splitting

3. **Caching** (Future Enhancement)
   - Redis for frequently accessed emission factors
   - Cache summary reports with TTL
   - Invalidate cache on data updates

### Large Dataset Handling

1. **Batch Processing**
   - Bulk upload endpoint handles multiple records
   - Process in chunks to avoid memory issues

2. **Background Jobs** (Future Enhancement)
   - Queue system for large recalculations
   - Async processing for bulk operations
   - Progress tracking for long-running tasks

3. **Data Archival**
   - Archive old usage records (> 5 years)
   - Maintain aggregated summaries

## Logging

### Current Implementation

- Console logging via NestJS logger
- Log levels controlled by `LOG_LEVEL` environment variable
- TypeORM query logging in DEBUG mode

### Structured Logging (Recommended Enhancement)

For production, implement structured logging:

```typescript
// Example with Winston or Pino
import { Logger } from '@nestjs/common';

// Structured log format
{
  timestamp: '2024-01-15T10:30:00Z',
  level: 'info',
  context: 'ElectricityUsageService',
  message: 'Electricity usage uploaded',
  facilityId: 'uuid',
  year: 2024,
  month: 3,
  consumptionKwh: 15000.5,
  traceId: 'abc-123'
}
```

### Logging Strategy

1. **Request Logging**
   - Log all API requests with request ID
   - Include user context (if authentication added)

2. **Business Events**
   - Data uploads
   - Emissions calculations
   - Anomaly detections
   - Recalculations

3. **Error Logging**
   - Full stack traces
   - Request context
   - User information

4. **Performance Logging**
   - Slow query logging (> 1s)
   - Request duration
   - Database connection pool metrics

### Log Aggregation

- **Local Development**: Console output
- **Production**: Send to centralized logging service
  - AWS CloudWatch Logs
  - ELK Stack (Elasticsearch, Logstash, Kibana)
  - Datadog
  - Splunk

## Monitoring

### Health Checks

The service provides health check endpoints:

- `GET /health` - Basic health check (database connectivity)
- `GET /health/metrics` - Detailed metrics

### Metrics Endpoint

Returns:
- Entity counts (organizations, facilities, usage records, emission factors)
- Total emissions calculated
- Anomaly count
- Timestamp

### Production Monitoring (Recommended)

1. **Application Performance Monitoring (APM)**
   - New Relic
   - Datadog APM
   - AWS X-Ray

2. **Database Monitoring**
   - PostgreSQL query performance
   - Connection pool metrics
   - Slow query alerts

3. **Infrastructure Metrics**
   - CPU, Memory, Disk usage
   - Network I/O
   - Container metrics (if using Docker/Kubernetes)

4. **Business Metrics**
   - Upload success/failure rates
   - Average processing time
   - Anomaly detection rate
   - API response times

5. **Alerting**
   - Service downtime
   - High error rates
   - Database connection failures
   - Unusual spike in anomalies
   - Slow API responses

### Example Monitoring Setup

```yaml
# Prometheus metrics (future enhancement)
metrics:
  - http_request_duration_seconds
  - http_requests_total
  - database_query_duration_seconds
  - electricity_usage_uploads_total
  - emissions_calculated_total
  - anomalies_detected_total
```

## AWS Deployment

### Containerization

The service is containerized using Docker:

```dockerfile
# Multi-stage build for optimized image size
FROM node:18-alpine AS builder
# ... build steps ...

FROM node:18-alpine
# ... production image ...
```

### Deployment Options

#### Option 1: AWS ECS (Elastic Container Service)

1. **Build and Push Image**
   ```bash
   # Build image
   docker build -t ecoratings:latest .
   
   # Tag for ECR
   docker tag ecoratings:latest <account>.dkr.ecr.<region>.amazonaws.com/ecoratings:latest
   
   # Push to ECR
   aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
   docker push <account>.dkr.ecr.<region>.amazonaws.com/ecoratings:latest
   ```

2. **ECS Task Definition**
   ```json
   {
     "family": "ecoratings",
     "containerDefinitions": [{
       "name": "ecoratings-api",
       "image": "<account>.dkr.ecr.<region>.amazonaws.com/ecoratings:latest",
       "portMappings": [{
         "containerPort": 3000,
         "protocol": "tcp"
       }],
       "environment": [
         {"name": "DATABASE_HOST", "value": "<rds-endpoint>"},
         {"name": "NODE_ENV", "value": "production"}
       ],
       "secrets": [
         {"name": "DATABASE_PASSWORD", "valueFrom": "arn:aws:secretsmanager:..."}
       ]
     }]
   }
   ```

3. **RDS PostgreSQL**
   - Use AWS RDS for managed PostgreSQL
   - Enable automated backups
   - Multi-AZ for high availability
   - Security groups for network isolation

4. **Application Load Balancer (ALB)**
   - Route traffic to ECS tasks
   - Health checks on `/health` endpoint
   - SSL/TLS termination

#### Option 2: AWS EKS (Elastic Kubernetes Service)

1. **Kubernetes Deployment**
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: ecoratings
   spec:
     replicas: 3
     template:
       spec:
         containers:
         - name: api
           image: <ecr-image>
           env:
           - name: DATABASE_HOST
             valueFrom:
               secretKeyRef:
                 name: db-secret
                 key: host
   ```

2. **Service and Ingress**
   - Kubernetes Service for internal routing
   - Ingress with ALB controller
   - Horizontal Pod Autoscaler (HPA)

#### Option 3: AWS App Runner

Simpler option for containerized applications:
- Automatic scaling
- Built-in load balancing
- Easy deployment from ECR

### Infrastructure as Code

Use **AWS CDK** or **Terraform** for infrastructure:

```typescript
// Example AWS CDK
const ecsCluster = new ecs.Cluster(this, 'EcoRatingsCluster', {
  vpc: vpc
});

const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
  memoryLimitMiB: 512,
  cpu: 256
});

// Add container, RDS, ALB, etc.
```

### Security

1. **Secrets Management**
   - AWS Secrets Manager for database credentials
   - IAM roles for service authentication
   - No hardcoded credentials

2. **Network Security**
   - VPC with private subnets
   - Security groups restricting access
   - RDS in private subnet

3. **Application Security**
   - HTTPS only (TLS 1.2+)
   - Input validation
   - Rate limiting (future)
   - Authentication/Authorization (future)

### CI/CD Pipeline

```yaml
# Example GitHub Actions / AWS CodePipeline
stages:
  - build:
      - Run tests
      - Build Docker image
      - Push to ECR
  - deploy:
      - Update ECS service
      - Run database migrations
      - Health check verification
```

### Maintenance

1. **Database Backups**
   - Automated RDS snapshots
   - Point-in-time recovery
   - Cross-region backup replication

2. **Updates**
   - Blue-green deployments
   - Database migrations via Alembic (or similar)
   - Rollback procedures

3. **Monitoring**
   - CloudWatch dashboards
   - Alarms for critical metrics
   - Log aggregation in CloudWatch Logs

## Testing

### Running Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

### Test Coverage

- Unit tests for services
- Integration tests for API endpoints
- Test database for isolation

### Example Test

See `src/organizations/organizations.service.spec.ts` and `src/emissions/emissions.service.spec.ts` for examples.

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.


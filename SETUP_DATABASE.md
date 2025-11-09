# Database Setup Guide

## Option 1: Install PostgreSQL Locally (macOS)

### Using Homebrew (Recommended)

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb ecoratings

# Verify connection
psql -d ecoratings -c "SELECT version();"
```

### Using PostgreSQL.app

1. Download from: https://postgresapp.com/
2. Install and launch the app
3. Click "Initialize" to create a new server
4. Create database:
   ```bash
   /Applications/Postgres.app/Contents/Versions/latest/bin/createdb ecoratings
   ```

## Option 2: Use Docker Desktop

1. Install Docker Desktop from: https://www.docker.com/products/docker-desktop
2. Start Docker Desktop
3. Run:
   ```bash
   docker-compose up -d postgres
   ```
4. Wait for PostgreSQL to be ready (about 10 seconds)
5. Start your application:
   ```bash
   npm run start:dev
   ```

## Option 3: Use Cloud Database (for testing)

You can use a free PostgreSQL service like:
- **Supabase**: https://supabase.com (free tier available)
- **Neon**: https://neon.tech (free tier available)
- **Railway**: https://railway.app (free tier available)

Update your `.env` file with the cloud database connection string.

## Verify Connection

After setting up PostgreSQL, verify the connection:

```bash
# Test connection
psql -h localhost -U postgres -d ecoratings -c "SELECT 1;"
```

If you see `?column?` with value `1`, the connection works!

## Troubleshooting

### Connection Refused
- Make sure PostgreSQL is running: `brew services list` (for Homebrew)
- Check if port 5432 is available: `lsof -i :5432`
- Verify credentials in `.env` file

### Permission Denied
- Check PostgreSQL user permissions
- Try: `psql -U postgres -d postgres` to connect as superuser

### Database Doesn't Exist
- Create it: `createdb ecoratings`
- Or connect to postgres and run: `CREATE DATABASE ecoratings;`


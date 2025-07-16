# Docker Setup for Chatty Server

This directory contains Docker configuration files for running the Chatty server.

## Files

- `Dockerfile` - Multi-stage Docker build for the Node.js/TypeScript server
- `.dockerignore` - Excludes unnecessary files from Docker build context
- `docker-compose.yml` - Complete stack with MongoDB, Redis, and Kafka

## Prerequisites

- Docker and Docker Compose installed
- Environment variables configured (create `.env` file)

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://mongo:27017/chatty

# Redis
REDIS_URL=redis://redis:6379

# Kafka
KAFKA_BROKERS=kafka:9092

# Firebase (if using)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Cloudinary (if using)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# JWT
JWT_SECRET=your-jwt-secret

# Server
PORT=3000
NODE_ENV=production
```

## Quick Start

### Option 1: Docker Compose (Recommended)

Run the complete stack with all dependencies:

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Option 2: Docker Only

Build and run just the server container:

```bash
# Build the image
docker build -t chatty-server .

# Run the container
docker run -p 3000:3000 --env-file .env chatty-server
```

## Development

For development with hot reload, you can override the command:

```bash
# Create a development docker-compose override
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

Create `docker-compose.dev.yml`:
```yaml
version: '3.8'
services:
  chatty-server:
    command: npm run dev
    volumes:
      - ./src:/app/src
      - ./package.json:/app/package.json
      - ./tsconfig.json:/app/tsconfig.json
    environment:
      - NODE_ENV=development
```

## Accessing Services

- **Server**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379
- **Kafka**: localhost:9092

## Health Check

The Docker container includes a health check that verifies the server is responding:

```bash
# Check container health
docker ps

# View health check logs
docker inspect --format='{{json .State.Health}}' <container-id>
```

## Production Considerations

1. **Security**: The Dockerfile creates a non-root user for better security
2. **Secrets**: Use Docker secrets or environment variables for sensitive data
3. **Volumes**: Persist uploads directory and database volumes
4. **Networking**: Configure proper network security
5. **Monitoring**: Add logging and monitoring solutions

## Troubleshooting

### Container won't start
- Check environment variables are set correctly
- Verify all dependencies (MongoDB, Redis, Kafka) are running
- Check Docker logs: `docker logs <container-name>`

### Can't connect to database
- Ensure MongoDB container is running and healthy
- Check connection string in environment variables
- Verify network connectivity between containers

### File uploads not working
- Ensure uploads directory is properly mounted
- Check file permissions on the volume

## Building for Production

```bash
# Build optimized production image
docker build --target production -t chatty-server:prod .

# Tag for registry
docker tag chatty-server:prod your-registry/chatty-server:latest

# Push to registry
docker push your-registry/chatty-server:latest
``` 
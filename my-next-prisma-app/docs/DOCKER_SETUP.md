# 🐳 QuizMania Docker Setup & Production Deployment

Complete Docker configuration for QuizMania with security hardening and production optimizations.

## 📋 System Requirements

### Hardware Requirements
- **CPU**: 4+ cores (8+ recommended for production)
- **RAM**: 8GB minimum (16GB+ for production)
- **Storage**: 20GB free space (50GB+ for production)
- **Network**: Stable internet for external services

### Software Prerequisites
- **Docker** 20.10+ with Docker Compose 2.0+
- **Git** for repository management
- **SSL Certificate** for production deployment

## 🚀 Quick Start Guide

### 1. Repository Setup
```bash
git clone <your-repository-url>
cd my-next-prisma-app
```

### 2. Environment Configuration
```bash
# Copy and configure environment
cp env.example .env.local

# Edit .env.local with your actual credentials
# Required for minimal setup:
nano .env.local
```

### 3. Development Deployment
```bash
# Start all development services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service health
docker-compose ps
```

### 4. Access Development Services
- 🌐 **QuizMania App**: http://localhost:3000
- 🎮 **Admin Dashboard**: http://localhost:3000/admin
- 🔌 **WebSocket Server**: http://localhost:3001
- � **Grafana Dashboard**: http://localhost:3001 (admin/admin)
- � **Prometheus Metrics**: http://localhost:9090
- 🗄️ **Database**: postgresql://localhost:5432/quizmania
- � **Redis**: redis://localhost:6379

## 🏭 Production Deployment

### 1. Production Environment Setup
```bash
# Create production environment file
cp env.example .env.production

# Configure production variables
export NODE_ENV=production
```

### 2. Security Configuration
```env
# Production security settings
NODE_ENV=production
ADMIN_SECRET_KEY=your_32_character_secret_key
ENCRYPTION_KEY=your_32_character_encryption_key
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Database security
POSTGRES_PASSWORD=secure_random_password_here
DATABASE_URL="postgresql://quizmania:secure_password@db:5432/quizmania"

# Authentication (Production Clerk keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```
   ```bash
   # Ensure .env.local has production values
   # Required:
   # - All Clerk credentials
   # - Secure database passwords
   # - Payment gateway credentials
   # - Media storage credentials
   ```

2. **Start Production Environment**
   ```bash
   # Linux/macOS
   ./docker/scripts/docker-manager.sh prod:start
   
   # Windows
   docker\scripts\docker-manager.bat prod:start
   ```

3. **Access Production Services**
   - 🌐 **Web App**: http://localhost (via Nginx)
   - 📊 **Prometheus**: http://localhost:9090
   - 📈 **Grafana**: http://localhost:3001

## 🛠️ Available Commands

### Development Commands
```bash
# Start development environment
./docker/scripts/docker-manager.sh dev:start

# Stop development environment  
./docker/scripts/docker-manager.sh dev:stop

# Restart development environment
./docker/scripts/docker-manager.sh dev:restart

# View development logs
./docker/scripts/docker-manager.sh dev:logs [service]
```

### Production Commands
```bash
# Start production environment
./docker/scripts/docker-manager.sh prod:start

# Stop production environment
./docker/scripts/docker-manager.sh prod:stop

# Restart production environment
./docker/scripts/docker-manager.sh prod:restart

# View production logs
./docker/scripts/docker-manager.sh prod:logs [service]
```

### Database Commands
```bash
# Run database migrations
./docker/scripts/docker-manager.sh db:migrate

# Seed database with sample data
./docker/scripts/docker-manager.sh db:seed

# Reset database (⚠️ destructive)
./docker/scripts/docker-manager.sh db:reset

# Create database backup
./docker/scripts/docker-manager.sh db:backup
```

### Utility Commands
```bash
# Show service status
./docker/scripts/docker-manager.sh status

# Check service health
./docker/scripts/docker-manager.sh health

# Show logs for specific service
./docker/scripts/docker-manager.sh logs [service]

# Clean up Docker resources
./docker/scripts/docker-manager.sh cleanup

# Show help
./docker/scripts/docker-manager.sh help
```

## 🏗️ Architecture Overview

### Services

#### Core Application Services
- **app**: Next.js 15.3.4 application (Port 3000)
- **ws-server**: WebSocket server for real-time features (Port 4000)
- **nginx**: Reverse proxy and load balancer (Port 80/443)

#### Data Services
- **postgres**: PostgreSQL 15.6 database (Port 5432)
- **redis**: Redis 7.2 for caching and sessions (Port 6379)

#### External Services
- **livekit**: Voice chat server (Ports 7880-7882)

#### Monitoring Services
- **prometheus**: Metrics collection (Port 9090)
- **grafana**: Dashboards and visualization (Port 3001)
- **redis_exporter**: Redis metrics (Port 9121)
- **postgres_exporter**: PostgreSQL metrics (Port 9187)

#### Development Tools
- **adminer**: Database administration (Port 8080)
- **redis-commander**: Redis GUI (Port 8081)
- **mailhog**: Email testing (Port 8025)

### Networks
- **quizmania-network**: Production network
- **quizmania-dev-network**: Development network

### Volumes
- **postgres_data**: Database persistence
- **redis_data**: Redis persistence
- **prometheus_data**: Metrics storage
- **grafana_data**: Dashboard configurations

## 🔧 Configuration Files

### Dockerfiles
- `Dockerfile`: Multi-stage production build for Next.js app
- `Dockerfile.dev`: Development build with hot reloading
- `ws-server/Dockerfile`: Production WebSocket server
- `ws-server/Dockerfile.dev`: Development WebSocket server

### Docker Compose Files
- `docker-compose.yml`: Production configuration
- `docker-compose.override.yml`: Development overrides

### Configuration Files
- `docker/nginx/nginx.conf`: Nginx main configuration
- `docker/nginx/conf.d/default.conf`: Virtual host configuration
- `docker/redis/redis.conf`: Redis optimization settings
- `docker/postgres/init-scripts/`: Database initialization

## 🔐 Environment Variables

### Required for Development
```env
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Database
DATABASE_URL="postgresql://quizmania:quizmania_dev@postgres:5432/quizmania_dev"

# Redis
REDIS_URL="redis://redis:6379"

# WebSocket
NEXT_PUBLIC_WS_URL="http://localhost:3001"
```

### Required for Production
```env
# All development variables plus:

# Secure passwords
DATABASE_URL="postgresql://quizmania:SECURE_PASSWORD@postgres:5432/quizmania"

# Payment processing
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_KEY_SECRET="live_secret_..."

# Media storage
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Monitoring
GRAFANA_ADMIN_PASSWORD="secure_password"
```

## 🚨 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :5432

# Stop conflicting services
sudo systemctl stop postgresql  # If local PostgreSQL is running
```

#### Memory Issues
```bash
# Increase Docker memory allocation
# Docker Desktop > Settings > Resources > Memory > 8GB+
```

#### Permission Issues (Linux/macOS)
```bash
# Make scripts executable
chmod +x docker/scripts/docker-manager.sh

# Fix file permissions
sudo chown -R $USER:$USER ./
```

#### Database Connection Issues
```bash
# Check database logs
./docker/scripts/docker-manager.sh logs postgres

# Reset database
./docker/scripts/docker-manager.sh db:reset
```

### Health Checks

#### Check Service Status
```bash
./docker/scripts/docker-manager.sh health
```

#### Check Individual Services
```bash
# Check app health
curl http://localhost:3000/api/health

# Check WebSocket server
curl http://localhost:3001/health

# Check database
docker-compose exec postgres pg_isready -U quizmania

# Check Redis
docker-compose exec redis redis-cli ping
```

### Logs and Debugging

#### View All Logs
```bash
./docker/scripts/docker-manager.sh logs
```

#### View Specific Service Logs
```bash
./docker/scripts/docker-manager.sh logs app
./docker/scripts/docker-manager.sh logs ws-server
./docker/scripts/docker-manager.sh logs postgres
./docker/scripts/docker-manager.sh logs redis
```

#### Debug Mode
```bash
# Run with debug output
docker-compose up --no-deps app

# Attach to running container
docker-compose exec app /bin/sh
```

## 🔄 Updates and Maintenance

### Updating Dependencies
```bash
# Stop services
./docker/scripts/docker-manager.sh dev:stop

# Rebuild with latest packages
docker-compose build --no-cache

# Start services
./docker/scripts/docker-manager.sh dev:start
```

### Database Migrations
```bash
# Run new migrations
./docker/scripts/docker-manager.sh db:migrate

# Generate new migration
docker-compose exec app npx prisma migrate dev --name migration_name
```

### Backup and Restore
```bash
# Create backup
./docker/scripts/docker-manager.sh db:backup

# Restore from backup (manual)
docker-compose exec -T postgres psql -U quizmania -d quizmania < backup_file.sql
```

## 📈 Monitoring

### Prometheus Metrics
- Application metrics: http://localhost:9090
- Custom business metrics for quiz performance
- Infrastructure metrics (CPU, memory, disk)

### Grafana Dashboards
- Access: http://localhost:3001
- Default credentials: admin/admin123
- Pre-configured dashboards for:
  - Application performance
  - Database metrics
  - Redis performance
  - WebSocket connections

### Log Aggregation
- Centralized logging through Docker
- Structured JSON logs for better parsing
- Log rotation and retention policies

## 🚀 Deployment

### Production Deployment
1. Configure production environment variables
2. Set up SSL certificates in `docker/nginx/ssl/`
3. Update domain names in nginx configuration
4. Run production stack: `./docker/scripts/docker-manager.sh prod:start`

### Cloud Deployment
- AWS ECS/Fargate ready
- GCP Cloud Run compatible
- Azure Container Instances ready
- Kubernetes manifests available (separate setup)

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review logs: `./docker/scripts/docker-manager.sh logs`
3. Check service health: `./docker/scripts/docker-manager.sh health`
4. Create an issue with logs and environment details

---

**Happy QuizMania Development! 🎯🎮**

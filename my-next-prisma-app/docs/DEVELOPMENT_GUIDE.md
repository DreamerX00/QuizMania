# 🎯 QuizMania Development Guide

## 🚀 Getting Started with Docker

This guide will help you set up and develop QuizMania using Docker containers for a consistent development environment.

### Prerequisites

- **Docker Desktop**: Latest version with at least 8GB RAM allocated
- **Git**: For version control
- **VS Code** (recommended): With Docker extension for better development experience

### 📦 Quick Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-next-prisma-app
   ```

2. **Set up environment variables**
   ```bash
   # Copy the environment template
   cp .env.example .env.local
   
   # Edit .env.local with your credentials
   # Minimum required for development:
   # - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   # - CLERK_SECRET_KEY
   ```

3. **Start development environment**
   ```bash
   # Make script executable (Linux/macOS)
   chmod +x docker/scripts/docker-manager.sh
   
   # Start development environment
   ./docker/scripts/docker-manager.sh dev:start
   
   # Windows users
   docker\scripts\docker-manager.bat dev:start
   ```

4. **Access your services**
   - 🌐 **Main App**: http://localhost:3000
   - 🔌 **WebSocket API**: http://localhost:4000
   - 🗄️ **Database Admin**: http://localhost:8080 (Adminer)
   - 📊 **Redis GUI**: http://localhost:8081 (Redis Commander)
   - 📧 **Email Testing**: http://localhost:8025 (MailHog)

## 🛠️ Development Workflow

### Daily Development Commands

```bash
# Start your development day
./docker/scripts/docker-manager.sh dev:start

# View live logs while developing
./docker/scripts/docker-manager.sh logs app        # Next.js app logs
./docker/scripts/docker-manager.sh logs ws-server  # WebSocket server logs

# Run database operations
./docker/scripts/docker-manager.sh db:migrate      # Apply migrations
./docker/scripts/docker-manager.sh db:seed         # Seed with test data

# End your development day
./docker/scripts/docker-manager.sh dev:stop
```

### Code Changes and Hot Reloading

The development setup includes:
- **Next.js Hot Reloading**: Changes to React components refresh automatically
- **WebSocket Server Hot Reloading**: TypeScript changes restart the WebSocket server
- **Database Schema Changes**: Run `db:migrate` after Prisma schema changes
- **Environment Changes**: Restart containers after changing `.env.local`

### Making Code Changes

1. **Frontend Changes**: Edit files in `src/` - changes auto-reload
2. **WebSocket Changes**: Edit files in `ws-server/` - server auto-restarts
3. **Database Changes**: 
   ```bash
   # Edit prisma/schema.prisma
   # Then run:
   ./docker/scripts/docker-manager.sh db:migrate
   ```

### Debugging

#### Debug with VS Code
1. Attach VS Code to running containers
2. Use breakpoints in your code
3. Debug ports are exposed (9229 for both app and ws-server)

#### View Application Logs
```bash
# All services
./docker/scripts/docker-manager.sh logs

# Specific service
./docker/scripts/docker-manager.sh logs app
./docker/scripts/docker-manager.sh logs postgres
./docker/scripts/docker-manager.sh logs redis
```

#### Database Debugging
```bash
# Access database directly
docker-compose exec postgres psql -U quizmania -d quizmania_dev

# Or use Adminer web interface
# http://localhost:8080
# Server: postgres
# Username: quizmania
# Password: quizmania_dev
# Database: quizmania_dev
```

#### Redis Debugging
```bash
# Access Redis CLI
docker-compose exec redis redis-cli

# Or use Redis Commander web interface
# http://localhost:8081
```

## 🔧 Advanced Development

### Custom Environment Variables

Add custom variables to `.env.local`:
```env
# Custom API endpoints
CUSTOM_API_URL=http://localhost:8000

# Feature flags
ENABLE_EXPERIMENTAL_FEATURES=true

# Debug settings
DEBUG_MODE=true
VERBOSE_LOGGING=true
```

### Adding New Services

1. **Add to docker-compose.override.yml**:
   ```yaml
   services:
     new-service:
       image: some-image:tag
       ports:
         - "8080:8080"
       environment:
         - NODE_ENV=development
       networks:
         - quizmania-dev-network
   ```

2. **Update docker manager scripts** to include health checks

### Database Development

#### Creating Migrations
```bash
# Create a new migration
docker-compose exec app npx prisma migrate dev --name add_new_feature

# Reset and reseed database
./docker/scripts/docker-manager.sh db:reset
./docker/scripts/docker-manager.sh db:seed
```

#### Prisma Studio
```bash
# Open Prisma Studio for visual database editing
docker-compose exec app npx prisma studio
# Access at http://localhost:5555
```

### WebSocket Development

#### Testing WebSocket Connections
```javascript
// Test WebSocket connection in browser console
const socket = io('http://localhost:4000');
socket.on('connect', () => console.log('Connected!'));
socket.emit('test', { message: 'Hello' });
```

#### WebSocket Server Development
- Edit files in `ws-server/`
- Server automatically restarts on changes
- Check logs: `./docker/scripts/docker-manager.sh logs ws-server`

### Performance Testing

#### Load Testing Setup
```bash
# Install k6 or artillery for load testing
npm install -g artillery

# Create test scripts in tests/load/
artillery run tests/load/websocket-test.yml
```

#### Monitoring During Development
- **Resource Usage**: Docker Desktop dashboard
- **Application Metrics**: http://localhost:4000/metrics (Prometheus format)
- **Database Performance**: Use Adminer to check query performance

## 🧪 Testing

### Running Tests in Containers

```bash
# Run unit tests
docker-compose exec app npm test

# Run integration tests
docker-compose exec app npm run test:integration

# Run E2E tests
docker-compose exec app npm run test:e2e
```

### Test Database

The development setup includes a separate test database:
```bash
# Run tests with test database
docker-compose exec app npm run test:db
```

## 🚨 Troubleshooting

### Common Development Issues

#### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change port in docker-compose.override.yml
```

#### Container Won't Start
```bash
# Check container logs
docker logs my-next-prisma-app_app_1

# Rebuild container
docker-compose build --no-cache app

# Remove problematic volumes
docker-compose down -v
```

#### Database Connection Issues
```bash
# Check PostgreSQL logs
./docker/scripts/docker-manager.sh logs postgres

# Verify database health
docker-compose exec postgres pg_isready -U quizmania
```

#### Hot Reload Not Working
```bash
# Restart development environment
./docker/scripts/docker-manager.sh dev:restart

# Check file permissions (Linux/macOS)
sudo chown -R $USER:$USER ./
```

### Reset Everything
```bash
# Nuclear option - reset everything
./docker/scripts/docker-manager.sh cleanup
./docker/scripts/docker-manager.sh dev:start
./docker/scripts/docker-manager.sh db:migrate
./docker/scripts/docker-manager.sh db:seed
```

## 📱 Mobile Development

### Testing on Mobile Devices

1. **Find your local IP**:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig | findstr IPv4
   ```

2. **Update environment variables**:
   ```env
   NEXT_PUBLIC_WS_SERVER_URL=http://YOUR_IP:4000
   ```

3. **Access from mobile**: http://YOUR_IP:3000

### Responsive Development
- Use browser dev tools responsive mode
- Test on actual devices using local IP
- Chrome DevTools device emulation

## 🔄 Git Workflow with Docker

### Switching Branches
```bash
# Stop current environment
./docker/scripts/docker-manager.sh dev:stop

# Switch branch
git checkout feature-branch

# Rebuild and start (in case of dependency changes)
./docker/scripts/docker-manager.sh dev:start

# Run migrations if schema changed
./docker/scripts/docker-manager.sh db:migrate
```

### Pull Request Testing
```bash
# Test someone else's PR
git fetch origin pull/123/head:pr-123
git checkout pr-123
./docker/scripts/docker-manager.sh dev:restart
./docker/scripts/docker-manager.sh db:migrate
```

## 🎯 Best Practices

### Development Efficiency
1. **Keep containers running** during active development
2. **Use logs extensively** for debugging
3. **Backup database** before major schema changes
4. **Use separate branches** for experimental features
5. **Test WebSocket features** in multiple browser tabs

### Code Quality
1. **Run linting** before commits: `docker-compose exec app npm run lint`
2. **Format code**: `docker-compose exec app npm run format`
3. **Type checking**: `docker-compose exec app npm run type-check`

### Performance
1. **Monitor resource usage** in Docker Desktop
2. **Optimize database queries** using Adminer
3. **Profile WebSocket performance** using browser dev tools
4. **Check bundle size** with `npm run analyze`

---

**Happy Development! 🎮✨**

Need help? Check the main [DOCKER_SETUP.md](DOCKER_SETUP.md) or create an issue!

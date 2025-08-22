# 🐳 Docker Configuration Prompt Template

## 📋 Universal Docker Setup Instruction

Use this prompt to instruct me to create complete Docker configurations for any full-stack project:

---

## 🎯 **PROMPT TEMPLATE**

```
Please create a complete Docker configuration for my project with the following requirements:

## 📁 Project Structure
- **Project Name**: [Your Project Name]
- **Repository**: [GitHub Repository URL or Local Path]
- **Architecture**: [e.g., Full-Stack Web App, Mobile + Backend, Microservices]

## 🛠️ Technology Stack

### Backend
- **Framework**: [e.g., Spring Boot, Node.js, Django, FastAPI, .NET]
- **Language**: [e.g., Java, Kotlin, JavaScript, Python, C#]
- **Version**: [e.g., Java 21, Node 18, Python 3.11]
- **Database**: [e.g., PostgreSQL, MySQL, MongoDB, Redis]
- **Port**: [e.g., 8080, 3001, 5000]

### Frontend
- **Framework**: [e.g., React, Vue, Angular, Next.js, Svelte]
- **Build Tool**: [e.g., Vite, Webpack, Create React App]
- **Language**: [e.g., TypeScript, JavaScript]
- **Version**: [e.g., React 18, Vue 3, Angular 15]
- **Port**: [e.g., 3000, 8080, 4200]

### Mobile (if applicable)
- **Platform**: [e.g., React Native, Flutter, Android, iOS]
- **Language**: [e.g., JavaScript, Dart, Kotlin, Swift]

### Additional Services
- **Cache**: [e.g., Redis, Memcached]
- **Message Queue**: [e.g., RabbitMQ, Apache Kafka]
- **Reverse Proxy**: [e.g., Nginx, Apache]
- **Monitoring**: [e.g., Prometheus, Grafana]

## 🎯 Requirements

### Environment Types
- [ ] **Production Environment** (docker-compose.yml)
- [ ] **Development Environment** (docker-compose.override.yml)
- [ ] **Testing Environment** (docker-compose.test.yml)

### Features Needed
- [ ] **Multi-stage Docker builds** for optimization
- [ ] **Hot reloading** for development
- [ ] **Debug ports** for development debugging
- [ ] **Health checks** for all services
- [ ] **Volume persistence** for databases
- [ ] **Network isolation** for security
- [ ] **Environment variables** configuration
- [ ] **SSL/TLS support** (if needed)
- [ ] **Load balancing** (if multiple instances)

### Development Features
- [ ] **Live code reloading** without container rebuild
- [ ] **Database seeding** with sample data
- [ ] **Development tools** (e.g., adminer, mailhog)
- [ ] **Log aggregation** and viewing
- [ ] **Performance monitoring**

## 🔧 Specific Configurations

### Database Requirements
- **Database Type**: [PostgreSQL/MySQL/MongoDB/etc.]
- **Version**: [e.g., PostgreSQL 15, MySQL 8.0]
- **Initial Schema**: [Yes/No - provide schema file if yes]
- **Sample Data**: [Yes/No - provide seed data if yes]
- **Backup Strategy**: [Yes/No]

### Security Requirements
- **Authentication**: [JWT, OAuth, Session-based]
- **HTTPS**: [Required/Optional]
- **API Keys**: [List any external APIs used]
- **Secrets Management**: [Docker secrets, .env files]

### Performance Requirements
- **Caching**: [Redis, In-memory, None]
- **CDN**: [CloudFlare, AWS CloudFront, None]
- **Load Balancing**: [Nginx, HAProxy, None]
- **Scaling**: [Horizontal, Vertical, None]

## 📄 File Structure Preferences
```
project/
├── docker-compose.yml              # Production
├── docker-compose.override.yml     # Development
├── docker-compose.test.yml         # Testing (optional)
├── .env.example                    # Environment template
├── Dockerfile.backend              # Backend container
├── Dockerfile.frontend             # Frontend container
├── docker/                         # Docker-related files
│   ├── nginx/                     # Nginx configs
│   ├── postgres/                  # Database init scripts
│   └── scripts/                   # Utility scripts
└── docs/
    ├── DOCKER_SETUP.md            # Setup documentation
    └── DEVELOPMENT_GUIDE.md       # Development guide
```

## 🎯 Deliverables Requested

Please provide:
1. **Complete docker-compose.yml** (production)
2. **docker-compose.override.yml** (development)
3. **Individual Dockerfiles** for each service
4. **Environment variable templates** (.env.example)
5. **Nginx configuration** (if web server needed)
6. **Database initialization scripts** (if applicable)
7. **Documentation** (setup and usage guides)
8. **Utility scripts** (start/stop/logs/cleanup)
9. **Health check configurations**
10. **Performance optimization settings**

## 🚀 Additional Instructions
- Optimize for [development speed / production performance / both]
- Include [specific features or requirements]
- Follow [specific naming conventions]
- Use [specific base images or registries]
- Ensure compatibility with [specific platforms: Windows/Mac/Linux]

## 🔍 Validation Requirements
After setup, I should be able to:
- [ ] Start the entire stack with one command
- [ ] Access all services on specified ports
- [ ] See logs for all services
- [ ] Make code changes with live reloading
- [ ] Connect to the database
- [ ] Run tests in isolated environment
- [ ] Deploy to production with minimal changes
```

---

## 📝 **Example Usage**

Here's how you would fill out this template for a typical project:

```
Please create a complete Docker configuration for my project with the following requirements:

## 📁 Project Structure
- **Project Name**: TaskManager Pro
- **Repository**: https://github.com/myuser/taskmanager-pro
- **Architecture**: Full-Stack Web App with Mobile API

## 🛠️ Technology Stack

### Backend
- **Framework**: Node.js with Express
- **Language**: TypeScript
- **Version**: Node 18 LTS
- **Database**: PostgreSQL + Redis
- **Port**: 3001

### Frontend
- **Framework**: Next.js
- **Build Tool**: Next.js built-in
- **Language**: TypeScript
- **Version**: Next.js 14
- **Port**: 3000

### Additional Services
- **Cache**: Redis 7
- **Reverse Proxy**: Nginx

## 🎯 Requirements
- [x] Production Environment (docker-compose.yml)
- [x] Development Environment (docker-compose.override.yml)
- [x] Multi-stage Docker builds for optimization
- [x] Hot reloading for development
- [x] Debug ports for development debugging
- [x] Health checks for all services
- [x] Volume persistence for databases
- [x] Environment variables configuration

... (continue with your specific requirements)
```

---

## 🔧 **Quick Templates for Common Stacks**

### MERN Stack (MongoDB, Express, React, Node)
```
Backend: Node.js + Express + TypeScript, Port 5000
Frontend: React + Vite + TypeScript, Port 3000
Database: MongoDB 6.0
Cache: Redis 7
```

### Spring Boot + React
```
Backend: Spring Boot + Java 21, Port 8080
Frontend: React + Vite + TypeScript, Port 3000
Database: PostgreSQL 15
```

### Django + Vue
```
Backend: Django + Python 3.11, Port 8000
Frontend: Vue 3 + Vite + TypeScript, Port 3000
Database: PostgreSQL 15
Cache: Redis 7
```

### .NET + Angular
```
Backend: .NET 8 + C#, Port 5000
Frontend: Angular 17 + TypeScript, Port 4200
Database: SQL Server 2022
```

---

## 📚 **Additional Resources**

When using this prompt, you can also ask me to:
- Create CI/CD pipeline configurations
- Add monitoring and logging
- Set up development tools (database admin, email testing)
- Configure SSL certificates
- Add backup and restore scripts
- Create deployment documentation
- Set up environment synchronization
- Add security scanning and linting

Save this template and customize it for each new project to get consistent, professional Docker configurations!

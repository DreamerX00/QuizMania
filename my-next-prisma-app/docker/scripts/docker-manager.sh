#!/bin/bash

# QuizMania Docker Management Script
# Usage: ./docker-scripts.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Development commands
dev_start() {
    print_info "Starting QuizMania in development mode..."
    check_docker
    
    # Copy environment file if it doesn't exist
    if [ ! -f .env.local ]; then
        print_warning ".env.local not found. Copying from .env.example..."
        cp .env.example .env.local
        print_warning "Please edit .env.local with your actual values before proceeding."
        exit 1
    fi
    
    docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build -d
    print_success "Development environment started!"
    print_info "Services available at:"
    echo "  🌐 Web App: http://localhost:3000"
    echo "  🔌 WebSocket: http://localhost:3001"
    echo "  🗄️  Database Admin: http://localhost:8080"
    echo "  📊 Redis Commander: http://localhost:8081"
    echo "  📧 MailHog: http://localhost:8025"
}

dev_stop() {
    print_info "Stopping development environment..."
    docker-compose -f docker-compose.yml -f docker-compose.override.yml down
    print_success "Development environment stopped!"
}

dev_restart() {
    print_info "Restarting development environment..."
    dev_stop
    dev_start
}

dev_logs() {
    print_info "Showing development logs..."
    docker-compose -f docker-compose.yml -f docker-compose.override.yml logs -f ${2:-}
}

# Production commands
prod_start() {
    print_info "Starting QuizMania in production mode..."
    check_docker
    
    if [ ! -f .env.local ]; then
        print_error ".env.local not found. Please create it from .env.example"
        exit 1
    fi
    
    docker-compose up --build -d
    print_success "Production environment started!"
    print_info "Services available at:"
    echo "  🌐 Web App: http://localhost (via Nginx)"
    echo "  📊 Monitoring: http://localhost:9090 (Prometheus)"
    echo "  📈 Dashboards: http://localhost:3001 (Grafana)"
}

prod_stop() {
    print_info "Stopping production environment..."
    docker-compose down
    print_success "Production environment stopped!"
}

prod_restart() {
    print_info "Restarting production environment..."
    prod_stop
    prod_start
}

prod_logs() {
    print_info "Showing production logs..."
    docker-compose logs -f ${2:-}
}

# Database commands
db_migrate() {
    print_info "Running database migrations..."
    docker-compose exec app npx prisma migrate deploy
    print_success "Database migrations completed!"
}

db_seed() {
    print_info "Seeding database..."
    docker-compose exec app npm run seed
    print_success "Database seeded!"
}

db_reset() {
    print_warning "This will reset the database and lose all data. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_info "Resetting database..."
        docker-compose exec app npx prisma migrate reset --force
        print_success "Database reset completed!"
    else
        print_info "Database reset cancelled."
    fi
}

db_backup() {
    print_info "Creating database backup..."
    timestamp=$(date +%Y%m%d_%H%M%S)
    docker-compose exec postgres pg_dump -U quizmania quizmania > "backup_${timestamp}.sql"
    print_success "Database backup created: backup_${timestamp}.sql"
}

# Utility commands
cleanup() {
    print_info "Cleaning up Docker resources..."
    docker-compose down --rmi local --volumes --remove-orphans
    docker system prune -f
    print_success "Cleanup completed!"
}

health_check() {
    print_info "Checking service health..."
    
    services=("app" "ws-server" "postgres" "redis")
    for service in "${services[@]}"; do
        if docker-compose ps "$service" | grep -q "Up"; then
            print_success "$service is running"
        else
            print_error "$service is not running"
        fi
    done
}

show_status() {
    print_info "Service status:"
    docker-compose ps
}

show_logs() {
    service=${1:-}
    if [ -n "$service" ]; then
        print_info "Showing logs for $service..."
        docker-compose logs -f "$service"
    else
        print_info "Showing all logs..."
        docker-compose logs -f
    fi
}

# Help function
show_help() {
    echo "QuizMania Docker Management Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Development Commands:"
    echo "  dev:start     Start development environment"
    echo "  dev:stop      Stop development environment"
    echo "  dev:restart   Restart development environment"
    echo "  dev:logs      Show development logs"
    echo ""
    echo "Production Commands:"
    echo "  prod:start    Start production environment"
    echo "  prod:stop     Stop production environment"
    echo "  prod:restart  Restart production environment"
    echo "  prod:logs     Show production logs"
    echo ""
    echo "Database Commands:"
    echo "  db:migrate    Run database migrations"
    echo "  db:seed       Seed database with sample data"
    echo "  db:reset      Reset database (destructive)"
    echo "  db:backup     Create database backup"
    echo ""
    echo "Utility Commands:"
    echo "  status        Show service status"
    echo "  health        Check service health"
    echo "  logs [service] Show logs for all services or specific service"
    echo "  cleanup       Clean up Docker resources"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev:start"
    echo "  $0 logs app"
    echo "  $0 db:migrate"
}

# Main command handler
case "${1:-help}" in
    "dev:start")
        dev_start
        ;;
    "dev:stop")
        dev_stop
        ;;
    "dev:restart")
        dev_restart
        ;;
    "dev:logs")
        dev_logs "$@"
        ;;
    "prod:start")
        prod_start
        ;;
    "prod:stop")
        prod_stop
        ;;
    "prod:restart")
        prod_restart
        ;;
    "prod:logs")
        prod_logs "$@"
        ;;
    "db:migrate")
        db_migrate
        ;;
    "db:seed")
        db_seed
        ;;
    "db:reset")
        db_reset
        ;;
    "db:backup")
        db_backup
        ;;
    "status")
        show_status
        ;;
    "health")
        health_check
        ;;
    "logs")
        show_logs "$2"
        ;;
    "cleanup")
        cleanup
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac

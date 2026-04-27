#!/bin/bash

# AI-Powered Smart Agriculture Platform Deployment Script
# This script automates the deployment of the entire platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p nginx/ssl
    mkdir -p logs
    mkdir -p backups
    
    print_success "Directories created"
}

# Generate environment files
generate_env_files() {
    print_status "Generating environment files..."
    
    # Backend .env
    if [ ! -f backend/.env ]; then
        cat > backend/.env << EOF
# Server Configuration
PORT=5001
NODE_ENV=production

# MongoDB Configuration
MONGODB_URI=mongodb://admin:password123@mongodb:27017/ai_agriculture_platform?authSource=admin
MONGODB_TEST_URI=mongodb://admin:password123@mongodb:27017/ai_agriculture_platform_test?authSource=admin

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production_$(date +%s)
JWT_EXPIRE=7d

# Flask ML API Configuration
ML_API_URL=http://ml-api:5000

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Weather API Configuration
WEATHER_API_KEY=your_openweather_api_key_here

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
FRONTEND_URL=http://localhost:3000
EOF
        print_success "Backend .env file created"
    else
        print_warning "Backend .env file already exists"
    fi
    
    # Frontend .env
    if [ ! -f frontend/.env ]; then
        cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:5001
REACT_APP_ML_API_URL=http://localhost:5000
EOF
        print_success "Frontend .env file created"
    else
        print_warning "Frontend .env file already exists"
    fi
}

# Build and train ML models
build_ml_models() {
    print_status "Building and training ML models..."
    
    cd ml-model
    
    # Check if models already exist
    if [ -f "models/best_crop_model.pkl" ]; then
        print_warning "ML models already exist. Skipping training."
    else
        print_status "Installing Python dependencies..."
        pip install -r requirements.txt
        
        print_status "Generating dataset..."
        python data/generate_dataset.py
        
        print_status "Training ML models..."
        python src/model_training.py
        
        print_status "Training fertilizer recommendation model..."
        python src/fertilizer_model.py
        
        print_success "ML models trained and saved"
    fi
    
    cd ..
}

# Build Docker images
build_docker_images() {
    print_status "Building Docker images..."
    
    docker-compose build --no-cache
    
    print_success "Docker images built successfully"
}

# Start services
start_services() {
    print_status "Starting services..."
    
    # Start database first
    docker-compose up -d mongodb redis
    
    # Wait for databases to be ready
    print_status "Waiting for databases to be ready..."
    sleep 10
    
    # Start application services
    docker-compose up -d ml-api backend frontend nginx
    
    print_success "All services started"
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    # Wait for services to be fully ready
    sleep 30
    
    # Check backend
    if curl -f http://localhost:5001/api/health > /dev/null 2>&1; then
        print_success "Backend API is healthy"
    else
        print_error "Backend API is not responding"
    fi
    
    # Check ML API
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        print_success "ML API is healthy"
    else
        print_error "ML API is not responding"
    fi
    
    # Check frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is accessible"
    else
        print_error "Frontend is not accessible"
    fi
}

# Show deployment summary
show_summary() {
    print_success "🎉 AI-Powered Smart Agriculture Platform deployed successfully!"
    echo
    echo "📊 Platform URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend API: http://localhost:5001"
    echo "  ML API: http://localhost:5000"
    echo "  MongoDB: mongodb://localhost:27017"
    echo "  Redis: redis://localhost:6379"
    echo
    echo "🔧 Management Commands:"
    echo "  View logs: docker-compose logs -f [service-name]"
    echo "  Stop services: docker-compose down"
    echo "  Restart services: docker-compose restart"
    echo "  Update services: docker-compose pull && docker-compose up -d"
    echo
    echo "📝 Next Steps:"
    echo "  1. Update environment variables with your actual values"
    echo "  2. Configure weather API key in backend/.env"
    email "  3. Set up SSL certificates for production"
    echo "  4. Configure backup strategy"
    echo "  5. Monitor system performance"
    echo
}

# Main deployment function
main() {
    echo "🌱 AI-Powered Smart Agriculture Platform Deployment"
    echo "=================================================="
    echo
    
    # Check prerequisites
    check_docker
    
    # Setup environment
    create_directories
    generate_env_files
    
    # Build ML models
    build_ml_models
    
    # Build and deploy
    build_docker_images
    start_services
    check_health
    show_summary
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "stop")
        print_status "Stopping all services..."
        docker-compose down
        print_success "All services stopped"
        ;;
    "restart")
        print_status "Restarting all services..."
        docker-compose restart
        print_success "All services restarted"
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "clean")
        print_warning "This will remove all containers, images, and volumes. Are you sure? (y/N)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            docker-compose down -v --rmi all
            print_success "All Docker resources cleaned"
        fi
        ;;
    "help")
        echo "Usage: $0 [command]"
        echo "Commands:"
        echo "  deploy   - Deploy the platform (default)"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  logs     - Show service logs"
        echo "  clean    - Remove all Docker resources"
        echo "  help     - Show this help message"
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Use '$0 help' for available commands"
        exit 1
        ;;
esac

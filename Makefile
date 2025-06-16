 # ==========================================
# 🚀 E-commerce API - Makefile
# ==========================================

.PHONY: help install dev prod build test clean logs health

# Default target
.DEFAULT_GOAL := help

# Colors for output
CYAN := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
NC := \033[0m # No Color

## 📚 Help
help: ## Show this help message
	@echo "$(CYAN)🚀 E-commerce API Commands$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "Usage:\n  make $(CYAN)<target>$(NC)\n\nTargets:\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(CYAN)%-15s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(YELLOW)%s$(NC)\n", substr($$0, 5) }' $(MAKEFILE_LIST)

##@ 🔧 Development
install: ## Install dependencies
	@echo "$(CYAN)📦 Installing dependencies...$(NC)"
	npm ci

dev: ## Start development environment with Docker
	@echo "$(CYAN)🚀 Starting development environment...$(NC)"
	./scripts/dev.sh

dev-local: ## Start development without Docker
	@echo "$(CYAN)🔧 Starting local development...$(NC)"
	npm run start:dev

##@ 🚀 Production
prod: ## Deploy to production with Docker
	@echo "$(CYAN)🚀 Deploying to production...$(NC)"
	./scripts/prod.sh

build: ## Build the application
	@echo "$(CYAN)🔨 Building application...$(NC)"
	npm run build

##@ 🐳 Docker Commands
docker-up: ## Start Docker services
	@echo "$(CYAN)🐳 Starting Docker services...$(NC)"
	docker-compose up -d

docker-down: ## Stop Docker services
	@echo "$(CYAN)🛑 Stopping Docker services...$(NC)"
	docker-compose down

docker-build: ## Build Docker image
	@echo "$(CYAN)🔨 Building Docker image...$(NC)"
	docker-compose build --no-cache

docker-logs: ## View Docker logs
	@echo "$(CYAN)📋 Viewing Docker logs...$(NC)"
	docker-compose logs -f

docker-clean: ## Clean Docker containers and volumes
	@echo "$(CYAN)🧹 Cleaning Docker containers and volumes...$(NC)"
	docker-compose down -v --remove-orphans
	docker system prune -f

##@ 🗄️ Database
db-migrate: ## Run database migrations
	@echo "$(CYAN)🗄️ Running database migrations...$(NC)"
	npm run migration:run

db-seed: ## Run database seeders
	@echo "$(CYAN)🌱 Running database seeders...$(NC)"
	npm run seed

db-setup: ## Setup database (migrate + seed)
	@echo "$(CYAN)🔧 Setting up database...$(NC)"
	npm run db:setup

db-refresh: ## Refresh database (revert + migrate + seed)
	@echo "$(CYAN)🔄 Refreshing database...$(NC)"
	npm run db:refresh

db-reset: ## Reset database completely
	@echo "$(CYAN)⚠️ Resetting database...$(NC)"
	npm run db:reset

##@ 🧪 Testing
test: ## Run unit tests
	@echo "$(CYAN)🧪 Running unit tests...$(NC)"
	npm run test

test-watch: ## Run tests in watch mode
	@echo "$(CYAN)👀 Running tests in watch mode...$(NC)"
	npm run test:watch

test-cov: ## Run tests with coverage
	@echo "$(CYAN)📊 Running tests with coverage...$(NC)"
	npm run test:cov

test-e2e: ## Run E2E tests
	@echo "$(CYAN)🔍 Running E2E tests...$(NC)"
	npm run test:e2e

##@ 📋 Code Quality
lint: ## Lint code
	@echo "$(CYAN)🔍 Linting code...$(NC)"
	npm run lint

format: ## Format code
	@echo "$(CYAN)💅 Formatting code...$(NC)"
	npm run format

##@ 📚 Documentation
docs-gen: ## Generate documentation
	@echo "$(CYAN)📚 Generating documentation...$(NC)"
	npm run compodoc:gen

docs-serve: ## Serve documentation
	@echo "$(CYAN)🌐 Serving documentation...$(NC)"
	npm run compodoc:serve

##@ 🏥 Health & Monitoring
health: ## Check API health
	@echo "$(CYAN)🏥 Checking API health...$(NC)"
	curl -f http://localhost:3000/health && echo "$(GREEN)✅ API is healthy$(NC)" || echo "$(RED)❌ API is unhealthy$(NC)"

logs: ## View application logs
	@echo "$(CYAN)📋 Viewing application logs...$(NC)"
	tail -f logs/*.log 2>/dev/null || echo "$(YELLOW)No log files found. Start the application first.$(NC)"

status: ## Show services status
	@echo "$(CYAN)📊 Services Status:$(NC)"
	@docker-compose ps 2>/dev/null || echo "$(YELLOW)Docker Compose not running$(NC)"

##@ 🔐 Security
security-audit: ## Run security audit
	@echo "$(CYAN)🔐 Running security audit...$(NC)"
	npm audit

security-fix: ## Fix security vulnerabilities
	@echo "$(CYAN)🔧 Fixing security vulnerabilities...$(NC)"
	npm audit fix

##@ 🧹 Cleanup
clean: ## Clean build artifacts and dependencies
	@echo "$(CYAN)🧹 Cleaning build artifacts...$(NC)"
	rm -rf dist/
	rm -rf node_modules/
	rm -rf coverage/
	rm -rf logs/*.log

clean-all: clean docker-clean ## Clean everything (build + docker)
	@echo "$(GREEN)✅ Everything cleaned!$(NC)"

##@ 🚀 Deployment
deploy-vercel: ## Deploy to Vercel
	@echo "$(CYAN)🚀 Deploying to Vercel...$(NC)"
	vercel deploy --prod

deploy-heroku: ## Deploy to Heroku
	@echo "$(CYAN)🚀 Deploying to Heroku...$(NC)"
	git push heroku main

##@ ℹ️ Information
info: ## Show project information
	@echo "$(CYAN)📋 Project Information:$(NC)"
	@echo "  Name: E-commerce API"
	@echo "  Version: $(shell node -p "require('./package.json').version")"
	@echo "  Node: $(shell node --version)"
	@echo "  NPM: $(shell npm --version)"
	@echo "  Docker: $(shell docker --version 2>/dev/null || echo 'Not installed')"
	@echo "  Docker Compose: $(shell docker-compose --version 2>/dev/null || echo 'Not installed')"

env-check: ## Check environment variables
	@echo "$(CYAN)🔍 Checking environment variables...$(NC)"
	@test -f .env && echo "$(GREEN)✅ .env file exists$(NC)" || echo "$(RED)❌ .env file missing$(NC)"
	@test -n "$$DB_HOST" && echo "$(GREEN)✅ DB_HOST is set$(NC)" || echo "$(YELLOW)⚠️ DB_HOST not set$(NC)"
	@test -n "$$JWT_SECRET" && echo "$(GREEN)✅ JWT_SECRET is set$(NC)" || echo "$(YELLOW)⚠️ JWT_SECRET not set$(NC)"
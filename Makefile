.PHONY: help install dev-fe dev-be test-fe test-be test-app test-db lint db-init docker-up docker-down push

# Default target: show help
help:
	@echo "Available commands:"
	@echo "  run              Start the application"
	@echo "  install          Update all installation requirements"
	@echo "  install-clean    installs all requirements and creates a venv"
	@echo "  docker-up        Start services using docker-compose"
	@echo "  docker-down      Stop services using docker-compose"
	@echo "  docker-build     Builds all services using docker-compose build"


install:
	.venv\scripts\activate && cd backend && pip install -r requirements.txt && cd ..

install-clean:
	python -m venv .venv
	$(MAKE) install

run:
	docker run -p 5000:5173 -d --rm healthdiary:latest

# Docker
docker-up:
	docker compose up -d --build -t healthdiary

docker-build:
	docker compose build -t healthdiary

docker-down:
	docker compose down


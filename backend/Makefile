-include .env
export

COMPOSE_FILE = docker-compose.backend.yml

DB_USER ?= postgres
DB_NAME ?= exchange_chain

.PHONY: up
up:
	docker-compose --env-file .env -f $(COMPOSE_FILE) up -d

.PHONY: build
build:
	docker-compose --env-file .env -f $(COMPOSE_FILE) build

.PHONY: down
down:
	docker-compose --env-file .env -f $(COMPOSE_FILE) down

.PHONY: psql
psql:
	docker-compose --env-file .env -f $(COMPOSE_FILE) exec postgres psql -U $(DB_USER) -d $(DB_NAME)


.PHONY: logs
logs:
	docker-compose --env-file .env -f $(COMPOSE_FILE) logs -f
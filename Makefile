-include .env
export

DB_USER ?= postgres
DB_NAME ?= exchange_chain

.PHONY: up
up:
	docker-compose up -d

.PHONY: build
build:
	docker-compose build

.PHONY: down
down:
	docker-compose down

.PHONY: psql
psql:
	docker-compose exec postgres psql -U $(DB_USER) -d $(DB_NAME)

.PHONY: logs
logs:
	docker-compose logs -f

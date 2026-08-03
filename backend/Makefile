include .env
export

COMPOSE_FILE = docker-compose.backend.yml

DB_USER ?= postgres
DB_NAME ?= exchange_chain

.PHONY: up
up:
	docker-compose --env-file .env -f $(COMPOSE_FILE) up -d

.PHONY: down
down:
	docker-compose --env-file .env -f $(COMPOSE_FILE) down

.PHONY: psql
psql:
	docker-compose --env-file .env -f $(COMPOSE_FILE) exec postgres psql -U $(DB_USER) -d $(DB_NAME)

.PHONY: seed
seed:
	@echo "⏳ Running seeds..."
	docker-compose --env-file .env -f $(COMPOSE_FILE) up -d postgres
	docker-compose --env-file .env -f $(COMPOSE_FILE) exec -T postgres psql -U $(DB_USER) -d $(DB_NAME) -f /seeds/01_users.sql
	docker-compose --env-file .env -f $(COMPOSE_FILE) exec -T postgres psql -U $(DB_USER) -d $(DB_NAME) -f /seeds/02_categories_level_0.sql
	docker-compose --env-file .env -f $(COMPOSE_FILE) exec -T postgres psql -U $(DB_USER) -d $(DB_NAME) -f /seeds/03_categories_level_1.sql
	docker-compose --env-file .env -f $(COMPOSE_FILE) exec -T postgres psql -U $(DB_USER) -d $(DB_NAME) -f /seeds/04_categories_level_2.sql
	docker-compose --env-file .env -f $(COMPOSE_FILE) exec -T postgres psql -U $(DB_USER) -d $(DB_NAME) -f /seeds/05_attributes_balls.sql
	docker-compose --env-file .env -f $(COMPOSE_FILE) exec -T postgres psql -U $(DB_USER) -d $(DB_NAME) -f /seeds/06_attributes_football.sql
	docker-compose --env-file .env -f $(COMPOSE_FILE) exec -T postgres psql -U $(DB_USER) -d $(DB_NAME) -f /seeds/07_attributes_basketball.sql
	docker-compose --env-file .env -f $(COMPOSE_FILE) exec -T postgres psql -U $(DB_USER) -d $(DB_NAME) -f /seeds/08_attributes_smartphones.sql
	docker-compose --env-file .env -f $(COMPOSE_FILE) exec -T postgres psql -U $(DB_USER) -d $(DB_NAME) -f /seeds/09_enum_football_surface.sql
	docker-compose --env-file .env -f $(COMPOSE_FILE) exec -T postgres psql -U $(DB_USER) -d $(DB_NAME) -f /seeds/10_enum_football_certification.sql
	docker-compose --env-file .env -f $(COMPOSE_FILE) exec -T postgres psql -U $(DB_USER) -d $(DB_NAME) -f /seeds/11_enum_basketball_surface.sql
	docker-compose --env-file .env -f $(COMPOSE_FILE) exec -T postgres psql -U $(DB_USER) -d $(DB_NAME) -f /seeds/12_enum_basketball_ball_type.sql
	docker-compose --env-file .env -f $(COMPOSE_FILE) exec -T postgres psql -U $(DB_USER) -d $(DB_NAME) -f /seeds/13_enum_smartphone_color.sql
	@echo "✅ Seeds completed!"

.PHONY: seed-reset
seed-reset:
	@echo "⏳ Resetting seeds..."
	docker-compose --env-file .env -f $(COMPOSE_FILE) exec -T postgres psql -U $(DB_USER) -d $(DB_NAME) -c "TRUNCATE TABLE attribute_values CASCADE;"
	docker-compose --env-file .env -f $(COMPOSE_FILE) exec -T postgres psql -U $(DB_USER) -d $(DB_NAME) -c "TRUNCATE TABLE category_attributes CASCADE;"
	docker-compose --env-file .env -f $(COMPOSE_FILE) exec -T postgres psql -U $(DB_USER) -d $(DB_NAME) -c "TRUNCATE TABLE categories CASCADE;"
	docker-compose --env-file .env -f $(COMPOSE_FILE) exec -T postgres psql -U $(DB_USER) -d $(DB_NAME) -c "TRUNCATE TABLE users CASCADE;"
	@echo "✅ Seeds reset completed!"

.PHONY: logs
logs:
	docker-compose --env-file .env -f $(COMPOSE_FILE) logs -f
# Локальный запуск с тестовыми данными

Seed-окружение изолировано от обычного Docker Compose отдельными сетью и volume.

## Запуск

```powershell
docker compose -f docker-compose.seed.yml up -d --build
```

Или через Makefile:

```bash
make up-seed
```

Основные миграции выполняются первыми. После них сервис `seeds` применяет SQL из
`seed-migrations` и записывает свою версию в отдельную таблицу `seed_migrations`.

## Проверка через Postman

Метод: `GET`

```text
http://localhost:8080/api/v1/chains/50000000-0000-0000-0000-000000000001
```

Заголовки и тело запроса не требуются. Порт можно изменить переменной
`SEED_SERVER_PORT`.

## Остановка

```powershell
docker compose -f docker-compose.seed.yml down
```

Для полного сброса исключительно тестовой базы вместе с seed-данными:

```powershell
docker compose -f docker-compose.seed.yml down -v
```

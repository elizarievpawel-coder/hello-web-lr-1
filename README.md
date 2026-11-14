# Personal Control Center

Веб-панель для учёта компьютерных устройств. Лабораторные 1–3 выполнены в одном проекте.

## Что реализовано

- Адаптивный каталог устройств (HTML, CSS).
- Поиск по названию, фильтрация ОС, сортировка (JavaScript).
- Добавление, удаление и **ручное** изменение статуса устройств в интерфейсе.
- Backend на Python и FastAPI с пятью CRUD-маршрутами.
- Реляционная база данных SQLite через SQLAlchemy.
- Проверка данных на сервере (Pydantic), ошибки 400/404/422.
- Автоматическая документация OpenAPI и Swagger UI.
- Загрузка и изменение устройств на frontend через REST API (fetch).

**Важно:** это пока каталог устройств, а не настоящий удалённый мониторинг. Статус Online/Offline задаётся вручную. Считывание состояния компьютеров и удалённое управление планируются на следующих этапах.

## Запуск на Windows (PowerShell)

Нужен Python 3.10+ и Git. В терминале из корня проекта:

    git pull origin main
    py -3.10 -m venv backend\.venv-local
    backend\.venv-local\Scripts\python.exe -m pip install -r backend\requirements.txt
    cd backend
    .\.venv-local\Scripts\python.exe -m uvicorn app.main:app --reload

Откройте:
- Сайт: http://127.0.0.1:8000/
- Swagger UI: http://127.0.0.1:8000/docs
- OpenAPI JSON: http://127.0.0.1:8000/openapi.json
- Проверка сервера: http://127.0.0.1:8000/health

Frontend обслуживается тем же FastAPI: **не нужно открывать index.html через file://**, иначе обращения к /api/devices не сработают.

База создаётся автоматически в backend/devices.db при первом запуске; один раз добавляются 6 демонстрационных устройств. Последующие изменения не исчезают при перезапуске. Чтобы сбросить только тестовые данные, остановите сервер и удалите файл backend/devices.db — при следующем запуске он создастся заново.

Для Linux/macOS используйте команду python3 -m venv backend/.venv-local, установите зависимости через backend/.venv-local/bin/python и запустите сервер из каталога backend.

## Сущность Device

| Поле | Тип | Назначение |
|---|---|---|
| id | integer, PK | Идентификатор устройства |
| name | varchar(50), UNIQUE, NOT NULL | Уникальное имя |
| description | varchar(120), NOT NULL | Описание |
| os | varchar(50), NOT NULL | Операционная система |
| details | JSON, NOT NULL | Список характеристик |
| status | varchar(7), CHECK, NOT NULL | Online или Offline |
| image | varchar(300), NOT NULL | Путь изображения |
| alt | varchar(200), NOT NULL | Подпись изображения |
| created_at | datetime, NOT NULL | Дата создания записи |

## REST API

| Метод | Адрес | Назначение | Успешный статус |
|---|---|---|---|
| GET | /api/devices | Все устройства | 200 |
| POST | /api/devices | Создать | 201 |
| GET | /api/devices/{device_id} | Устройство по ID | 200 |
| PATCH | /api/devices/{device_id} | Изменить поля | 200 |
| DELETE | /api/devices/{device_id} | Удалить | 204 |

Ошибки: 400 — повторяющееся имя, 404 — ID не найден, 422 — некорректные поля, 500 — внутренняя ошибка сервера.

Пример тела POST /api/devices:

    {
      "name": "My Test PC",
      "description": "Компьютер для демонстрации",
      "os": "Windows 11",
      "details": ["Оперативная память: 16 ГБ"],
      "status": "Offline",
      "image": "assets/images/tn.jpg",
      "alt": "Тестовый компьютер"
    }

Пример PATCH /api/devices/1:

    {"status": "Offline"}

## Как показать лабораторную №3 на защите

1. Запустите сервер и откройте Swagger UI на http://127.0.0.1:8000/docs.
2. Покажите пять методов в группе Devices и схемы запросов/ответов.
3. Выполните GET /api/devices (6 стартовых устройств).
4. Выполните POST /api/devices с примером выше и запомните присвоенный id.
5. Выполните GET /api/devices/{id}, затем PATCH с {"status":"Online"}.
6. Откройте сайт http://127.0.0.1:8000/ и покажите, что запись появилась, статус меняется и сохраняется при перезагрузке.
7. Удалите тестовую запись через DELETE /api/devices/{id} (204), проверьте повторным GET (404).
8. Для демонстрации постоянства остановите и заново запустите сервер. Данные сохраняются в backend/devices.db.
9. Для скриншота таблицы откройте backend/devices.db в SQLite Viewer / DB Browser for SQLite и покажите таблицу devices.

Не публикуйте этот сервис в интернете без аутентификации и ограничения доступа: в учебной версии API доступен любому, кто может подключиться к серверу.

## Структура

- index.html — HTML-страница.
- styles/main.css — стили.
- js/app.js — рендер, фильтры, формы и fetch-запросы.
- backend/app/main.py — запуск FastAPI и раздача сайта.
- backend/app/database.py — подключение к SQLite и сессии.
- backend/app/models.py — SQLAlchemy-модель таблицы.
- backend/app/schemas.py — проверка данных Pydantic.
- backend/app/routers/devices.py — CRUD API.
- backend/app/seed.py — стартовые 6 устройств.
- backend/requirements.txt — Python-зависимости.

Виртуальное окружение backend/.venv было добавлено в историю Git ранее. Новое окружение .venv-local исключается через .gitignore; старые отслеживаемые файлы пока не удалялись.

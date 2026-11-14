# Personal Control Center

**Отчёт по лабораторным работам №1–4.**

Personal Control Center — веб-приложение для учёта компьютерных устройств и компьютерных сред. Разработка выполнялась последовательно: статический сайт → интерактивный интерфейс → REST API и база данных → мониторинг Docker-контейнеров.

> **Границы возможностей:** у карточек устройств статус Online/Offline пока выставляется вручную. Реальный мониторинг **Docker-контейнеров** реализован отдельным стеком cAdvisor + Prometheus + Grafana. Это не означает, что веб-приложение уже удалённо измеряет состояние всех компьютеров из каталога.

## Содержание

1. [Лабораторная №1 — HTML и CSS](#лабораторная-работа-1--статический-frontend)
2. [Лабораторная №2 — JavaScript и localStorage](#лабораторная-работа-2--интерактивный-frontend)
3. [Лабораторная №3 — FastAPI, REST и SQLite](#лабораторная-работа-3--backend-rest-api-и-база-данных)
4. [Лабораторная №4 — Docker, cAdvisor, Prometheus и Grafana](#лабораторная-работа-4--мониторинг-docker-контейнеров)
5. [Структура проекта](#структура-проекта)

---

## Лабораторная работа №1 — статический Frontend

### Цель

Создать семантически организованный, адаптивный веб-интерфейс для выбранной темы с применением HTML и CSS.

### Выполнение работы

Создан сайт **Personal Control Center**, в котором представлены шесть компьютерных устройств и сред:

- Gigabyte G6 MF — основной ноутбук;
- Acer Aspire A315-53G — старый ноутбук;
- Desktop PC — настольный ПК;
- Virtual Machine — виртуальная машина;
- Ubuntu Environment — среда разработки;
- Test Node — тестовый узел.

Использованы семантические элементы HTML: header, nav, main, section, article и footer. В разметку добавлены заголовки, разделы «Устройства» и «О проекте», изображения, характеристики устройств, форма поиска с подписями label.

Оформление находится в отдельном файле **styles/main.css**: CSS Grid отвечает за сетку карточек; Flexbox используется для навигации и форм; медиазапросы изменяют число колонок на различных экранах. Есть состояния hover и focus-visible. Исходная разметка — **index.html**.

### Результат и вывод

Получен адаптивный каталог устройств со светлым оформлением. Первая лабораторная создала основу интерфейса, которая затем была дополнена JavaScript и серверной частью.

---

## Лабораторная работа №2 — интерактивный Frontend

### Цель

Превратить статическую страницу в интерактивное одностраничное приложение на чистом JavaScript: работа с DOM, обработка событий, проверка форм, состояние приложения и сохранение данных в браузере.

### Выполнение работы

В файл **js/app.js** была добавлена логика:

1. Поиск устройств по названию без учёта регистра.
2. Фильтрация по операционным системам Windows, Linux или «Все».
3. Сортировка названий по возрастанию и убыванию.
4. Модальное окно с формой добавления устройства.
5. Проверка обязательных полей, длины текста и допустимого объёма RAM с отображением ошибок.
6. Удаление устройства через делегирование события click на общем контейнере.
7. Хранение текущего массива устройств в общем объекте state.
8. Перерисовка карточек функцией render() по изменённому состоянию.

На этапе ЛР2 сохранение данных осуществлялось в браузере с помощью localStorage, JSON.stringify() и JSON.parse(). При реализации ЛР3 хранение перенесено в SQLite, а взаимодействие с данными — в REST API. Поэтому в актуальном файле js/app.js используется серверный источник данных.

Объекты создаются через document.createElement(), пользовательский текст выводится через textContent, а не через innerHTML, чтобы не интерпретировать ввод как HTML-код. Для изменения карточек используется render(), сортировка работает с копией массива.

### Ключевой принцип

Состояние хранит устройства, строку поиска, выбранную ОС и порядок сортировки. При изменении параметра вызывается render(): видимые карточки строятся заново на основе актуального состояния.

### Результат и вывод

Реализован интерактивный интерфейс каталога, позволяющий выполнять поиск, фильтрацию, сортировку, добавление и удаление элементов. На этапе ЛР2 данные переживали перезагрузку страницы благодаря localStorage; на следующем этапе постоянное хранение было перенесено на сервер.

---

## Лабораторная работа №3 — Backend, REST API и база данных

### Цель

Разделить клиентскую и серверную части приложения; реализовать CRUD для основной сущности «Устройство»; хранить данные в реляционной базе; использовать OpenAPI и получать данные на frontend через HTTP.

### Используемые технологии

- **Python + FastAPI** — серверное приложение и REST API;
- **Pydantic** — проверка входных данных и схемы ответов;
- **SQLAlchemy** — ORM и работа с БД;
- **SQLite** — реляционная база данных;
- **JavaScript fetch()** — запросы с сайта к API;
- **Swagger UI / OpenAPI** — документация и тестирование методов.

### Сущность Device

Таблица **devices** содержит следующие поля:

| Поле | Тип и ограничение | Содержание |
|---|---|---|
| id | integer, PRIMARY KEY | Уникальный идентификатор |
| name | varchar(50), NOT NULL, UNIQUE | Название |
| description | varchar(120), NOT NULL | Описание |
| os | varchar(50), NOT NULL | Операционная система |
| details | JSON, NOT NULL | Массив характеристик |
| status | varchar(7), CHECK | Online или Offline |
| image | varchar(300), NOT NULL | Путь к изображению |
| alt | varchar(200), NOT NULL | Текст изображения |
| created_at | datetime, NOT NULL | Дата создания |

Поля запросов дополнительно проверяются Pydantic: обязательность, длины строк, типы и разрешённые статусы.

### Архитектура

**Браузер (HTML/JS)** → HTTP-запрос fetch() → **FastAPI** → SQLAlchemy → **SQLite** → JSON-ответ → обновление карточек.

При первом запуске, если таблицы ещё нет, SQLAlchemy создаёт таблицу devices, а **backend/app/seed.py** добавляет шесть демонстрационных устройств. При последующих запусках данные не пересоздаются.

### Реализованный REST API

| HTTP-метод | Путь | Действие | Успешный статус |
|---|---|---|---|
| GET | /api/devices | Получить список | 200 |
| POST | /api/devices | Добавить устройство | 201 |
| GET | /api/devices/{device_id} | Получить одно по ID | 200 |
| PATCH | /api/devices/{device_id} | Частично обновить | 200 |
| DELETE | /api/devices/{device_id} | Удалить | 204 |

Ошибки: **400** — например, повторяющееся название; **404** — неизвестный ID; **422** — ошибка валидации; **500** — неожиданная серверная ошибка.

Пример создания устройства:

~~~json
{
  "name": "My Test PC",
  "description": "Компьютер для демонстрации",
  "os": "Windows 11",
  "details": ["Оперативная память: 16 ГБ"],
  "status": "Offline",
  "image": "assets/images/tn.jpg",
  "alt": "Тестовый компьютер"
}
~~~

Пример PATCH-запроса к /api/devices/{device_id}:

~~~json
{"status": "Online"}
~~~

### Описание ключевых файлов

| Файл | Назначение |
|---|---|
| backend/app/main.py | Создание приложения, подключение маршрутов, запуск, раздача frontend |
| backend/app/database.py | SQLite engine, фабрика сессий и зависимость get_db |
| backend/app/models.py | ORM-модель Device и ограничения таблицы |
| backend/app/schemas.py | Схемы DeviceCreate, DeviceUpdate и DeviceRead |
| backend/app/routers/devices.py | Пять HTTP-обработчиков CRUD |
| backend/app/seed.py | Исходные демонстрационные устройства |
| backend/requirements.txt | Зависимости backend |
| js/app.js | fetch(), загрузка, создание, изменение и удаление устройств |

Основные операции с БД: db.add() добавляет объект в сессию, db.commit() фиксирует изменения, db.refresh() обновляет объект, db.get() находит запись по первичному ключу.

### Запуск ЛР3 локально в Windows

Из корня проекта в PowerShell:

~~~powershell
git pull origin main
py -3.10 -m venv backend\.venv-local
backend\.venv-local\Scripts\python.exe -m pip install -r backend\requirements.txt
cd backend
.\.venv-local\Scripts\python.exe -m uvicorn app.main:app --reload
~~~

Сайт: http://127.0.0.1:8000/; Swagger: http://127.0.0.1:8000/docs; OpenAPI JSON: http://127.0.0.1:8000/openapi.json; здоровье сервера: http://127.0.0.1:8000/health.

Frontend обслуживается FastAPI и обращается к относительным адресам /api/devices, поэтому открытие index.html через file:// не поддерживается. Локальная база — **backend/devices.db**. При запуске через Docker используется отдельный файл базы в именованном томе.

### Проверка REST API

Работоспособность API проверяется в Swagger UI по адресу **/docs**:

1. `GET /api/devices` — получение записей из базы.
2. `POST /api/devices` — создание новой записи (HTTP 201).
3. `GET /api/devices/{device_id}` — получение созданной записи по ID.
4. `PATCH /api/devices/{device_id}` — изменение статуса и сохранение нового значения.
5. `DELETE /api/devices/{device_id}` — удаление записи (HTTP 204); повторный запрос по ID возвращает HTTP 404.

Данные проверяются также через интерфейс сайта и повторную загрузку страницы. После перезапуска сервера содержимое базы сохраняется.

### Результат и вывод

На базе интерактивного сайта реализовано полноценное CRUD-приложение: frontend обращается к Python-серверу, данные сохраняются в SQLite, ошибки ввода обрабатываются, документация API создаётся автоматически. Настоящий сбор показателей удалённых компьютеров в этой лабораторной **не реализовывался**.

---

## Лабораторная работа №4 — мониторинг Docker-контейнеров

### Цель

Развернуть стек мониторинга Docker-контейнеров с тестовым веб-приложением, сбором метрик cAdvisor, хранением временных рядов в Prometheus и визуализацией в Grafana.

В данной конфигурации сбор метрик выполняется без отдельного сценария искусственной генерации нагрузки.

### Состав и принцип работы

| Сервис | Назначение |
|---|---|
| webapp | Существующий Personal Control Center на FastAPI |
| cAdvisor | Собирает CPU, RAM, сеть и доступные дисковые метрики контейнеров |
| Prometheus | Каждые 15 секунд опрашивает cAdvisor и сохраняет метрики |
| Grafana | Читает метрики из Prometheus и строит панели графиков |

**Docker-контейнеры** → cAdvisor (/metrics) → Prometheus (scrape, временные ряды, PromQL) → Grafana (дашборд).

Все четыре сервиса находятся в сети monitoring, определённой в **docker-compose.yml**. Порт сайта в контейнерном варианте — **8001**, чтобы не конфликтовать с ЛР3 на порту 8000.

### Выполнение работы

1. В **backend/Dockerfile** описана сборка контейнера готового сайта и сервера FastAPI.
2. В **docker-compose.yml** объявлены webapp, cadvisor, prometheus и grafana, их порты, тома и сеть.
3. В **monitoring/prometheus.yml** задан источник cadvisor:8080 и интервал 15 секунд.
4. В **monitoring/grafana/provisioning/datasources/prometheus.yml** автоматически подключён Prometheus по адресу http://prometheus:9090 (Docker-сеть).
5. Через конфигурацию provisioning и **monitoring/grafana/dashboards/docker-containers.json** подготовлен дашборд с CPU, RAM, входящим трафиком, дисковыми показателями и доступностью cAdvisor.
6. Постоянные Docker-тома device_data, prometheus_data и grafana_data сохраняют данные приложения, Prometheus и Grafana соответственно.

### Запуск в Ubuntu WSL 2

Для выполнения нужен установленный и запущенный Docker Engine с плагином Compose. В терминале Ubuntu:

~~~bash
cd ~/hello-web-lr-1
git pull origin main
sudo docker compose config
sudo docker compose up -d --build
sudo docker compose ps
~~~

В Ubuntu WSL 2 для запуска Docker используются команды с sudo. Если пользователь входит в группу docker, префикс sudo необязателен.

### Адреса сервисов

| Сервис | Адрес в браузере |
|---|---|
| Personal Control Center (Docker) | http://localhost:8001 |
| Swagger API | http://localhost:8001/docs |
| cAdvisor | http://localhost:8080 |
| Метрики cAdvisor | http://localhost:8080/metrics |
| Prometheus | http://localhost:9090 |
| Prometheus Targets | http://localhost:9090/targets |
| Grafana | http://localhost:3000 |

Начальные учётные данные Grafana в локальной конфигурации — **admin / admin**; после первого входа пароль изменяется. Дашборд расположен в **Dashboards → Personal Control Center → Personal Control Center — Docker Monitoring**. Интервал отображения: Last 15 minutes; автообновление: 15s.

### Проверка работоспособности

1. **Docker:** команда sudo docker compose ps показывает четыре запущенных сервиса; для webapp предусмотрена проверка состояния healthy.
2. **cAdvisor:** открыть http://localhost:8080, найти контейнеры и их метрики; при необходимости проверить /metrics.
3. **Prometheus Targets:** открыть http://localhost:9090/targets, убедиться, что job cadvisor — **UP**.
4. **PromQL:** выполнить запрос up{job="cadvisor"} (ожидаемый результат 1 при успешной доступности).
5. **Метрики:** выполнить запрос container_cpu_usage_seconds_total и убедиться, что есть данные.
6. **Grafana:** открыть подготовленный дашборд с графиками CPU/RAM/сети/диска. Для rate() требуются несколько точек; некоторые метрики могут быть недоступны в WSL2.

Команда docker compose ps подтвердила запуск четырёх контейнеров. Дополнительная проверка источника метрик и заполнения графиков производится через интерфейсы Prometheus и Grafana.

### Примеры запросов PromQL

~~~promql
up{job="cadvisor"}
~~~

~~~promql
container_cpu_usage_seconds_total
~~~

~~~promql
rate(container_cpu_usage_seconds_total[5m])
~~~

~~~promql
container_memory_working_set_bytes
~~~

~~~promql
rate(container_network_receive_bytes_total[5m])
~~~

В дашборде применяются агрегированные запросы с подписями контейнеров. Метрики диска могут отличаться по доступности в зависимости от cgroups и конфигурации WSL.

### Диагностика

Если сервис не работает, посмотреть логи:

~~~bash
sudo docker compose logs --tail=80 cadvisor
sudo docker compose logs --tail=80 prometheus
sudo docker compose logs --tail=80 grafana
sudo docker compose logs --tail=80 webapp
sudo docker info
~~~

Если target cadvisor = DOWN, проверить его логи, http://localhost:8080/metrics и конфигурацию Prometheus. Если Grafana не показывает данные, убедиться, что в Prometheus есть ряды и доступен источник данных Prometheus; URL внутри Docker-сети — http://prometheus:9090, не localhost. При пустом графике сначала проверить имя доступной метрики и её labels, затем фильтр в PromQL.

Остановка без удаления базы и истории:

~~~bash
sudo docker compose down
~~~

**Не выполнять sudo docker compose down -v**, если надо сохранить тома. Это учебная конфигурация: cAdvisor запускается с повышенными привилегиями, а API сайта не имеет авторизации. Сервисы опубликованы только на localhost; не рекомендуется выставлять их напрямую в Интернет.

### Результат и вывод

Разработан Docker Compose-стек для мониторинга веб-приложения. Четыре контейнера были запущены в Ubuntu WSL 2. Для оценки работы мониторинга используются состояние cAdvisor в Prometheus, наличие временных рядов и заполнение панелей Grafana. Искусственная нагрузка не создаётся.

---

## Структура проекта

~~~text
hello-web-lr-1/
├── README.md                 # Все отчёты и инструкции (ЛР1–ЛР4)
├── index.html                # Страница приложения
├── styles/main.css           # Стили
├── js/app.js                 # Логика интерфейса и REST-запросы
├── assets/images/            # Изображения устройств
├── backend/
│   ├── Dockerfile            # Образ webapp
│   ├── requirements.txt
│   └── app/
│       ├── __init__.py
│       ├── main.py
│       ├── database.py
│       ├── models.py
│       ├── schemas.py
│       ├── seed.py
│       └── routers/devices.py
├── docker-compose.yml        # Стек ЛР4
└── monitoring/
    ├── prometheus.yml
    └── grafana/
        ├── dashboards/docker-containers.json
        └── provisioning/
            ├── datasources/prometheus.yml
            └── dashboards/main.yml
~~~

**Окружение Python:** для локального запуска используется отдельное виртуальное окружение. Папка backend/.venv не требуется для сборки Docker.

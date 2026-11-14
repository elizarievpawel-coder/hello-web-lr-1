# Лабораторная работа №4 — Мониторинг Docker-контейнеров

## Что сделано

Мониторинг собственного сайта Personal Control Center через 4 Docker-контейнера:
- webapp — готовое приложение FastAPI и HTML/JS из лабораторных 1–3.
- cAdvisor — собирает использование CPU, оперативной памяти, сети и диска контейнерами.
- Prometheus — обращается к cAdvisor каждые 15 секунд, хранит метрики и позволяет выполнять запросы PromQL.
- Grafana — подключена к Prometheus и автоматически загружает дашборд с метриками.

Все контейнеры включены в Docker-сеть monitoring. Генерация искусственной нагрузки не входит в эту работу.

## Запуск через WSL

Включи Docker Engine или Docker Desktop с WSL Integration. Открой терминал WSL, перейди в папку проекта с docker-compose.yml. Если проект есть только в Windows, открой его через путь /mnt/c/... или клонируй в домашний каталог WSL.

    git pull origin main
    docker version
    docker compose version
    docker compose config
    docker compose up -d --build
    docker compose ps
    docker ps

Для просмотра логов конкретного контейнера:

    docker compose logs --tail=80 cadvisor
    docker compose logs --tail=80 prometheus
    docker compose logs --tail=80 grafana
    docker compose logs --tail=80 webapp

## Веб-интерфейсы

| Сервис | Адрес |
|---|---|
| Твой сайт | http://localhost:8001 |
| Swagger API сайта | http://localhost:8001/docs |
| cAdvisor | http://localhost:8080 |
| cAdvisor metrics | http://localhost:8080/metrics |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 |

Порт 8001 выбран для Docker-приложения, чтобы не конфликтовать с работающим сервером лабораторной №3 на 8000.

Grafana: логин и пароль admin / admin при первом запуске. Сразу измени пароль. Источник Prometheus и дашборд загружаются автоматически. Открой Dashboards → Personal Control Center → Personal Control Center — Docker Monitoring.

## Проверка по заданию

1. Команда docker compose ps должна показать 4 запущенных сервиса. Для webapp появится состояние healthy.
2. Открой cAdvisor. Найди список контейнеров и показатели CPU/RAM/сети/диска. При необходимости проверь /metrics.
3. В Prometheus открой Status → Targets (или Target health). Строка cadvisor должна иметь состояние UP.
4. В запросах Prometheus проверь up{job="cadvisor"} — результат 1 означает успешное подключение.
5. Проверь запрос container_cpu_usage_seconds_total. Должны появиться временные ряды контейнеров.
6. В Grafana открой автоматически созданный дашборд, выстави Last 15 minutes и обновление 15s. Покажи графики CPU, RAM, сети и диска. Для rate() необходимо накопить несколько точек, данные появятся не мгновенно.
7. Сделай скриншоты docker compose ps, cAdvisor, Prometheus Targets, запроса PromQL и дашборда Grafana. Блок генерации нагрузки и сравнения до/после не требуется.

## Как объяснить преподавателю

Это отдельный мониторинг контейнерной инфраструктуры: контейнер webapp продолжает отдавать твой сайт и REST API, cAdvisor измеряет ресурсы именно работающих Docker-контейнеров. Prometheus делает HTTP-запросы к cadvisor:8080/metrics по Docker-сети с интервалом 15 секунд и сохраняет показания как временные ряды. Grafana обращается к Prometheus по адресу http://prometheus:9090 и строит графики через PromQL.

- CPU: rate(container_cpu_usage_seconds_total[5m]) — скорость потребления процессорного времени.
- RAM: container_memory_working_set_bytes — используемая рабочая память контейнера.
- Сеть: rate(container_network_receive_bytes_total[5m]) — скорость входящего трафика.
- Диск: container_fs_reads_bytes_total и container_fs_writes_bytes_total — счётчики операций чтения/записи, доступны не во всех конфигурациях WSL.

Не путай с главным сайтом: ручные Online/Offline в карточках устройств НЕ являются статусами реального мониторинга, а Grafana отображает состояние контейнеров.

## Диагностика WSL / Docker

Если cadvisor не UP, проверь:

    docker compose logs --tail=100 cadvisor
    docker info
    docker compose config

Проверь, открывается ли http://localhost:8080/metrics. В Docker Desktop / WSL2 доступность части метрик может зависеть от расположения Docker daemon, cgroups и mount points. Отсутствие отдельной дисковой метрики не означает падение Prometheus; посмотри реальные метрики без фильтров в Explore / Prometheus.

Если Grafana без данных, проверь в Prometheus запрос up{job="cadvisor"} и затем container_cpu_usage_seconds_total. При наличии рядов проверь в Grafana выбранный datasource Prometheus и доступные labels.

Остановка:

    docker compose down

Данные сохраняются в именованных volumes device_data, prometheus_data и grafana_data. Не запускай docker compose down -v, если данные нужно сохранить.

В целях безопасности порты привязаны к localhost, а cAdvisor имеет расширенные привилегии Docker только для этой локальной учебной среды.

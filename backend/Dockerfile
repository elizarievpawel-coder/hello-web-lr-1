FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt
COPY index.html /app/index.html
COPY styles /app/styles
COPY js /app/js
COPY assets /app/assets
COPY backend/app /app/backend/app
WORKDIR /app/backend
ENV PYTHONUNBUFFERED=1
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

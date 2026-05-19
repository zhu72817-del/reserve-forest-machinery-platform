FROM python:3.11-slim

WORKDIR /app

COPY . .

ENV HOST=0.0.0.0
ENV PORT=8080
ENV PLATFORM_DB_PATH=/app/data/platform.db

EXPOSE 8080

CMD ["python3", "server.py"]

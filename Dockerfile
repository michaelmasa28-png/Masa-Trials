FROM python:3.12-slim

WORKDIR /app

# System deps for psycopg2 and bcrypt
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create upload directories
RUN mkdir -p public/uploads/sermons/images \
    public/uploads/sermons/videos \
    public/uploads/sermons/notes \
    public/uploads/gallery \
    public/uploads/events

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]

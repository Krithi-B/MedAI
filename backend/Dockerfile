# Use the official Python image
FROM python:3.10-slim

# Install system dependencies for Tesseract
RUN apt-get update && \
    apt-get install -y tesseract-ocr libtesseract-dev && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy all project files
COPY . /app

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose your Flask app port
EXPOSE 5000

# Command to run the Flask app
CMD ["python", "app.py"]

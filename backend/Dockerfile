FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire src directory into the container
COPY src/ ./src/

# Set environment variables
ENV FLASK_APP=src
ENV FLASK_RUN_HOST=0.0.0.0

EXPOSE 5000

# Run using the Flask CLI
CMD ["flask", "run"]
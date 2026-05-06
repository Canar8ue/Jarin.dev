# 1. Use a lightweight Python base image
FROM python:3.9-slim

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy requirements first (for better caching)
COPY requirements.txt .

# 4. Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of your app code
COPY . .

# 6. Run the app using Gunicorn
# -w 4 means "4 workers" (handles multiple users at once)
# -b 0.0.0.0:5000 means "listen on port 5000"
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]

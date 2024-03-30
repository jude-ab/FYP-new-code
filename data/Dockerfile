FROM python:3.9-slim

# Install build dependencies for compiling Python packages
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    libssl-dev \
    libffi-dev \
    python3-dev \
    python3-pip \
    libblas-dev \  
    liblapack-dev \
    gfortran \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /usr/src/app/data

# Copy the application source code into the container
COPY . .

# Install required packages from requirements.txt and other dependencies
COPY requirements.txt .
RUN pip install nltk
RUN pip install flask_apscheduler
RUN pip install --no-cache-dir -r requirements.txt

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Run app.py when the container launches
CMD ["python", "./recommender.py"]

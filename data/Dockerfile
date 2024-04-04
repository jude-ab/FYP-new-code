FROM python:3.9-slim

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

WORKDIR /usr/src/app/data

COPY . .

COPY requirements.txt .
RUN pip install nltk
RUN pip install flask_apscheduler
RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "./recommender.py"]






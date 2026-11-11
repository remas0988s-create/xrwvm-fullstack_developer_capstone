import os
from urllib.parse import quote

import requests


def get_request(endpoint):
    url = os.getenv("BACKEND_URL", "http://127.0.0.1:3030").rstrip("/")
    response = requests.get(f"{url}/{endpoint}", timeout=5)
    response.raise_for_status()
    return response.json()


def analyze_review_sentiments(text):
    url = os.getenv("SENTIMENT_URL", "http://127.0.0.1:5050").rstrip("/")
    response = requests.get(f"{url}/analyze/{quote(text, safe='')}", timeout=12)
    response.raise_for_status()
    return response.json()


def post_review(data):
    url = os.getenv("BACKEND_URL", "http://127.0.0.1:3030").rstrip("/")
    headers = {"X-Internal-Token": os.getenv("INTERNAL_TOKEN", "")}
    response = requests.post(f"{url}/insert_review", json=data, headers=headers, timeout=5)
    response.raise_for_status()
    return response.json()

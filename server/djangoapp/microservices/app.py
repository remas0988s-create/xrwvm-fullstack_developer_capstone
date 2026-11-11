"""Sentiment service supporting Watson NLU and the IBM starter's VADER approach."""
import os

import requests
from flask import Flask, jsonify
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

app = Flask(__name__)
analyzer = SentimentIntensityAnalyzer()


@app.get("/analyze/<path:text>")
def analyze_sentiment(text):
    url = os.getenv("WATSON_NLU_URL")
    key = os.getenv("WATSON_NLU_API_KEY")
    if url or key:
        if not url or not key:
            return jsonify(error="Watson NLU configuration is incomplete."), 503
        try:
            response = requests.post(
                f"{url.rstrip('/')}/v1/analyze",
                params={"version": "2022-04-07"},
                auth=("apikey", key),
                json={"text": text, "features": {"sentiment": {}}},
                timeout=8,
            )
            response.raise_for_status()
            label = response.json()["sentiment"]["document"]["label"]
        except (requests.RequestException, ValueError, KeyError):
            return jsonify(error="Watson NLU analysis failed."), 502
        return jsonify(sentiment=label, engine="Watson NLU")
    score = analyzer.polarity_scores(text)["compound"]
    label = "positive" if score >= 0.05 else "negative" if score <= -0.05 else "neutral"
    return jsonify(sentiment=label, engine="VADER")


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5050)

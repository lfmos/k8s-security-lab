import os

from flask import Flask, jsonify

app = Flask(__name__)

APP_NAME = "k8s-security-lab"
APP_VERSION = "2.0.0"
ENVIRONMENT = os.getenv("APP_ENV", "lab")


@app.get("/")
def index():
    return jsonify(
        {
            "application": APP_NAME,
            "version": APP_VERSION,
            "environment": ENVIRONMENT,
            "purpose": "Demo workload for Kubernetes security experiments",
        }
    )


@app.get("/health")
def health():
    return jsonify(
        {
            "status": "healthy",
            "application": APP_NAME,
        }
    )


@app.get("/ready")
def ready():
    return jsonify(
        {
            "status": "ready",
            "application": APP_NAME,
        }
    )


@app.get("/api/status")
def status():
    return jsonify(
        {
            "application": APP_NAME,
            "version": APP_VERSION,
            "environment": ENVIRONMENT,
            "security_lab": True,
        }
    )


@app.errorhandler(404)
def not_found(_error):
    return jsonify({"error": "not_found"}), 404


@app.errorhandler(405)
def method_not_allowed(_error):
    return jsonify({"error": "method_not_allowed"}), 405


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", "5000")),
        debug=False,
    )
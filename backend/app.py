import os
from datetime import datetime, timezone

from flask import Flask, jsonify

app = Flask(__name__)

APP_ENV = os.getenv("APP_ENV", "development")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
API_KEY = os.getenv("API_KEY", "")


@app.get("/health")
def health():
    """Confirma que o processo está ativo."""
    return jsonify({"status": "healthy"}), 200


@app.get("/ready")
def ready():
    """Confirma que a API está pronta para receber tráfego."""
    return jsonify({"status": "ready"}), 200


@app.get("/api/status")
def api_status():
    """Retorna apenas informações públicas da aplicação."""
    security_mode = "enabled" if API_KEY else "development"

    return jsonify(
        {
            "application": "Cluster Sentinel",
            "status": "online",
            "environment": APP_ENV,
            "version": APP_VERSION,
            "security_mode": security_mode,
            "platform": "Kubernetes",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    ), 200


@app.errorhandler(404)
def not_found(_error):
    return jsonify({"error": "resource_not_found"}), 404


@app.errorhandler(500)
def internal_error(_error):
    return jsonify({"error": "internal_server_error"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=False)

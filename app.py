#!/usr/bin/env python3
"""Простое Flask-приложение для тестирования Docker-контейнера."""

import datetime
import os
import platform

from flask import Flask, jsonify

app = Flask(__name__)


@app.route("/")
def home():
    """Главная страница с информацией о контейнере."""
    return jsonify({
        "message": "Приложение успешно запущено в Docker контейнере!",
        "timestamp": datetime.datetime.now().isoformat(),
        "python_version": platform.python_version(),
        "platform": platform.platform(),
        "container_id": os.environ.get("HOSTNAME", "unknown"),
        "environment": dict(os.environ),
    })


@app.route("/health")
def health():
    """Эндпоинт для проверки здоровья приложения."""
    return jsonify({"status": "healthy"}), 200


@app.route("/info")
def info():
    """Информация о системе."""
    return jsonify({
        "python_version": platform.python_version(),
        "platform": platform.platform(),
        "architecture": platform.architecture(),
        "processor": platform.processor(),
        "hostname": os.environ.get("HOSTNAME", "unknown"),
        "working_directory": os.getcwd(),
        "user": os.environ.get("USER", "unknown"),
    })


@app.route("/multiply/<int:a>/<int:b>")
def multiply(a, b):
    """Умножение двух чисел."""
    return jsonify({"result": a * b}), 200


@app.route("/divide/<int:a>/<int:b>")
def divide(a, b):
    """Деление двух чисел."""
    return jsonify({"result": a / b}), 200


if __name__ == "__main__":
    # 0.0.0.0 — слушать все интерфейсы внутри контейнера, иначе с компьютера не достучаться.
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port)

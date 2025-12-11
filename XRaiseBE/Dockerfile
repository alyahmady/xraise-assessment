FROM python:3.13.10-slim AS base

FROM base AS compile-image

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PIP_DEFAULT_TIMEOUT=100
ENV PIP_NO_CACHE_DIR=1

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip install --upgrade pip wheel

COPY requirements.txt .
RUN pip install -r ./requirements.txt && \
    find /opt/venv -type f -name "*.pyc" -delete 2>/dev/null && \
    find /opt/venv -type f -name "*.pyo" -delete 2>/dev/null && \
    find /opt/venv -type d -name "test" -name "tests" -delete 2>/dev/null

FROM base AS build-prod

WORKDIR /app/

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && \
    apt-get install -yqq --no-install-recommends \
    curl nano && \
    apt-get autoremove && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY --from=compile-image /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY apps /app/apps
COPY backend /app/backend
COPY manage.py /app/manage.py
COPY gunicorn_conf.py /app/gunicorn_conf.py

COPY scripts /app/scripts
RUN sed -i 's/\r$//g' /app/scripts/*.sh
RUN chmod -R +x /app/scripts/*.sh

ENTRYPOINT ["bash", "/app/scripts/entrypoint.sh"]
HEALTHCHECK --start-period=60s --interval=60s --timeout=5s --retries=3 CMD ["/app/scripts/health.sh"]

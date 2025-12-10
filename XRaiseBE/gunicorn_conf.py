from uvicorn_worker import UvicornWorker as BaseUvicornWorker


class UvicornWorker(BaseUvicornWorker):
    CONFIG_KWARGS = {"loop": "uvloop", "http": "httptools", "lifespan": "off"}


accesslog = "-"
errorlog = "-"
access_log_format = (
    " Address: %(h)s - User: %(u)s - Date: %(t)s - Time: %(T)s - QueryStrings: %(q)s - "
    "Status: %(s)s - Length: %(b)s - Referer: %(f)s - UserAgent: %(a)s - Info: %(r)s "
)
max_requests = 1000
max_requests_jitter = 50
workers = 4 # cpu_count() * 2

bind = ["0.0.0.0:8000"]
worker_class = "gunicorn_conf.UvicornWorker"
timeout = 1000

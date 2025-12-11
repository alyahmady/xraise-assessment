#!/bin/sh

curl --fail http://localhost:8000/api/health/ || exit 1

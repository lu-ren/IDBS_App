FROM python:3-onbuild
EXPOSE 5000
CMD ["source", "./venv/bin/activate"]
CMD ["python", "./server.py"]

from flask import Flask

app = None

def init_app(configFile=None):
    global app

    app = Flask(__name__)

    if configFile:
        app.config.from_object(configFile)

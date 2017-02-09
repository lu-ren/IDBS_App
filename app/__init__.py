from flask import Flask

app = None

def init_app(configFile=None):
    global app

    app = Flask(__name__)
    app.template_folder = 'template'

    if configFile:
        app.config.from_object(configFile)

    from app.view import index

    app.register_blueprint(index)

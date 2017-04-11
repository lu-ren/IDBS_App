from flask import Flask

app = None

def init_app(configFile=None):
    global app

    app = Flask(__name__)

    if configFile:
        app.config.from_object(configFile)

    from app.view import index

    app.register_blueprint(index)

    def _setupVideoObjLst():
        from glob import glob
        from random import shuffle
        import os

        videoPath = app.config['VIDEO_PATH']
        videoFiles = glob(os.path.realpath(videoPath) + '/*.mp4')
        videoFiles.sort()

        hklPath = app.config['HKL_PATH']
        hklFiles = glob(os.path.realpath(hklPath) + '/*000.hkl')
        hklFiles.sort()

        app.videoObjLst = zip(hklFiles, videoFiles)
        shuffle(app.videoObjLst)

    _setupVideoObjLst()

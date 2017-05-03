from flask import Flask
from flask_session import Session
from glob import glob
from random import shuffle
import os
import socket

app = None

def init_app(configFile=None):
    global app

    app = Flask(__name__)

    if configFile:
        app.config.from_object(configFile)

    from app.view import index

    app.register_blueprint(index)

    def _setupVideoObjLst():
        videoPath = app.config['VIDEO_PATH']
        videoFiles = glob(os.path.realpath(videoPath) + '/*.webm')
        videoFiles.sort()

        hklPath = app.config['HKL_PATH']
        hklFiles = glob(os.path.realpath(hklPath) + '/*000.hkl')
        hklFiles.sort()

        app.videoObjLst = zip(hklFiles, videoFiles)
        shuffle(app.videoObjLst)

    def _setupHklDictionary():
        app.hklFiles = {}
        app.reverseHklFiles = {}
        i = 0

        for f in sorted(os.listdir(app.config['HKL_PATH'])):
            app.hklFiles[f] = i
            app.reverseHklFiles[i] = f
            i += 1

    _setupVideoObjLst()
    _setupHklDictionary()

    Session(app)

    app.socket = socket.socket()
    app.socket.connect((app.config['ENGINE_IP'], app.config['ENGINE_PORT']))
    print('Connected to engine at %s:%d' % (app.config['ENGINE_IP'], app.config['ENGINE_PORT']))

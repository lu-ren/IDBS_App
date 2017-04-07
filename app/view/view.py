from app import app
from flask import Blueprint, render_template, session
from glob import glob
from scipy.misc import imsave
import base64
import hickle
import io
import json
import numpy
import os
import pdb

index = Blueprint('index', __name__)

def getBase64Img(hklFile):
    a = hickle.load(hklFile)[:, 3, :, :]
    b = numpy.transpose(a, (1, 2, 0))
    buf = io.BytesIO()
    imsave(buf, b, format='png')
    buf.seek(0)

    return base64.b64encode(buf.read())

def getVideoHklFiles():
    videoPath = app.config['VIDEO_PATH']
    videoFiles = glob(os.path.realpath(videoPath) + '/*.avi') 
    videoFiles.sort()

    hklPath = app.config['HKL_PATH']
    hklFiles = glob(os.path.realpath(hklPath) + '/*000.hkl')
    hklFiles.sort()

    return (videoFiles, hklFiles)


@index.route('/loadimage')
def loadImage():
    videoFiles, hklFiles = getVideoHklFiles()

    if 'imgLoadCount' not in session:
        session['imgLoadCount'] = 0

    loaded = session['imgLoadCount']
    videoData = []

    numLoad = min(len(hklFiles) - loaded, 10)

    for i in range(numLoad):
        videoData.append((getBase64Img(hklFiles[i]), videoFiles[i]))

    session['imgLoadCount'] += numLoad

    return json.dumps(videoData)

@index.route('/', methods=['GET', 'POST'])
def main():
    jsonVideoData = loadImage()

    return render_template('index.html', jsonVideoData=jsonVideoData)

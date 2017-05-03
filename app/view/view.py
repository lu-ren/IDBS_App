from app import app
from flask import Blueprint, render_template, session, request
from scipy.misc import imsave
import base64
import hickle
import io
import json
import numpy
import os
import re
import subprocess

import pdb

index = Blueprint('index', __name__)

def getBase64Img(hklFile):
    a = hickle.load(hklFile)[:, 3, :, :]
    b = numpy.transpose(a, (1, 2, 0))
    c = numpy.copy(b)
    c[:,:,0]=b[:,:,2]
    c[:,:,2]=b[:,:,0]
    buf = io.BytesIO()
    imsave(buf, c, format='png')
    buf.seek(0)

    return base64.b64encode(buf.read())

def getAppPath(videoFile):
    return app.config['SYMLK_VIDEO_PATH'] + '/' + os.path.basename(videoFile)

@index.route('/submitquery', methods=['POST'])
def submitQuery():
    session.clear()
    indexList = []
    query = json.loads(request.data)

    for q in query:
        print(q)
        videoFile = q[0]
        start = int(q[1])
        end = int(q[2])
        label = int(q[3])

        if (start % 16) <= 8:
            start -= start%16
        else:
            start += (16 - start%16)

        if (end % 16) <= 8:
            end -= end%16
        else:
            end += (16 - end%16)

        if(start==end):
            end += 16

        curFrame = start
        while curFrame < end:
            baseName = videoFile.split('.')[0]
            hklFile = baseName + '_' + str(curFrame).zfill(3) + '.hkl'
            if hklFile in app.hklFiles:
                print("dict check good")
                index = app.hklFiles[hklFile]
                indexList.append([index, label])
                curFrame += 16
            else:
                print("no good")
                break

    app.socket.send(json.dumps(indexList))

    resultHklIndices = json.loads(app.socket.recv(38000))
    result = [app.reverseHklFiles[i] for i in resultHklIndices]
    session['resultHklFiles'] = result

    response = loadQueryImage()

    return response

@index.route('/videometadata', methods=['POST'])
def getVideoMetaData():
    videoPath = app.root_path + request.data
    #fps comes back as a string like 25/1
    fps = subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v',
        '-of', 'default=noprint_wrappers=1:nokey=1', '-show_entries', 
        'stream=r_frame_rate', videoPath]).strip().split('/')

    meta = {}
    meta['fps'] = int(fps[0]) / int(fps[1])

    return json.dumps(meta)

@index.route('/loadqueryimage')
def loadQueryImage():
    hklFiles = session['resultHklFiles']

    if 'imgLoadCount' not in session:
        session['imgLoadCount'] = 0

    loaded = session['imgLoadCount']
    videoData = []

    numLoad = min(len(hklFiles) - loaded, 24)

    for i in range(numLoad):
        j = loaded + i
        f = hklFiles[j]
        videoFile = re.sub('_\d\d\d.hkl', '.webm', f)
        frameSlice = int(f[-7:-4])
        hklPath = os.path.realpath(app.config['HKL_PATH'] + '/' + f)
        videoData.append((getBase64Img(hklPath), getAppPath(videoFile), frameSlice))

    session['imgLoadCount'] += numLoad

    return json.dumps(videoData)

@index.route('/loadimage')
def loadImage():
    videoObjLst = app.videoObjLst

    if 'imgLoadCount' not in session:
        session['imgLoadCount'] = 0

    loaded = session['imgLoadCount']
    videoData = []

    numLoad = min(len(videoObjLst) - loaded, 24)

    for i in range(numLoad):
        j = loaded + i
        hklFile, videoFile = videoObjLst[j]
        videoData.append((getBase64Img(hklFile), getAppPath(videoFile)))

    session['imgLoadCount'] += numLoad

    return json.dumps(videoData)

@index.route('/', methods=['GET', 'POST'])
def main():
    session.clear()
    jsonVideoData = loadImage()

    return render_template('index.html', jsonVideoData=jsonVideoData)

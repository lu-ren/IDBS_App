from app import app
from flask import Blueprint, render_template, session, request
from scipy.misc import imsave
import base64
import hickle
import io
import json
import numpy
import os
import subprocess
import pdb

index = Blueprint('index', __name__)

def getBase64Img(hklFile):
    a = hickle.load(hklFile)[:, 3, :, :]
    b = numpy.transpose(a, (1, 2, 0))
    buf = io.BytesIO()
    imsave(buf, b, format='png')
    buf.seek(0)

    return base64.b64encode(buf.read())

def getAppPath(videoFile):
    return app.config['SYMLK_VIDEO_PATH'] + '/' + os.path.basename(videoFile)

@index.route('/submitquery', methods=['POST'])
def submitQuery():
    query = json.loads(request.data)
    return 0
	#print query
    #with open('selections.txt', 'w') as f:
        #for item in query:
            #for val in item:
                #f.write(str(val) + ',')
    #return 0

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

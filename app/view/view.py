from flask import Blueprint, render_template
from app import app
from glob import glob
import os
import json
import hickle

import pdb

index = Blueprint('index', __name__)

"""
Gets the thumbnails and video paths
"""
def getVideos():
    hklFiles = globl(os.path.realpath(hklPath) + '/*000.hkl')
    hklFiles.sort()

@index.route('/', methods=['GET', 'POST'])
def main():
    videoPath = app.config['VIDEO_PATH']
    videoFiles = glob(os.path.realpath(videoPath) + '/*.avi') 
    videoFiles.sort()

    thumbnailPath = app.config['THUMBNAIL_PATH']
    thumbnailFiles = glob(os.path.realpath(thumbnailPath) + '/*.png')
    thumbnailFiles.sort()

    videoData = zip(videoFiles, thumbnailFiles)

    return render_template('index.html', videoFiles=json.dumps(videoFiles))

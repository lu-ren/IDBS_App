from flask import Blueprint, render_template
from app import app
from glob import glob
import os
import json

import pdb

index = Blueprint('index', __name__)

@index.route('/', methods=['GET', 'POST'])
def main():
    videoPath = app.config['VIDEO_PATH'];
    videoFiles = glob(os.path.realpath(videoPath) + '/*.avi') 
    videoFiles.sort()
    return render_template('index.html', videoFiles=json.dumps(videoFiles))

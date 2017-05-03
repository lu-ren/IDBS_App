import os

class BasicConfig(object):
    DEBUG = False
    ENGINE_IP = '127.0.0.1'
    ENGINE_PORT = 8005
    HKL_PATH = '/data/UCF/preproc/UCF_all_clips'
    SECRET_KEY = '3jIUW8AMdlVv3gxJg9cRtkFUsyoK1KlK2+Folt77FEY='
    SESSION_TYPE = 'filesystem'
    SYMLK_VIDEO_PATH = '/static/videos/UCF' #symlinked path from app directory
    VIDEO_PATH = '/data/UCF/data/UCF101/Videos-WebM'
    WTF_CSRF_ENABLED = True
    secret_key = os.urandom(32)

class DebugConfig(BasicConfig):
    DEBUG = True

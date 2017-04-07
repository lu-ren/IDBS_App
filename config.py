class BasicConfig(object):
    DEBUG = False
    WTF_CSRF_ENABLED = True
    SECRET_KEY = '3jIUW8AMdlVv3gxJg9cRtkFUsyoK1KlK2+Folt77FEY='
    VIDEO_PATH = '/data/UCF/data/UCF101/Videos'
    THUMBNAIL_PATH = '/home/luren/thumbnails'

class DebugConfig(BasicConfig):
    DEBUG = True

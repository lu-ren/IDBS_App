class BasicConfig(object):
    DEBUG = False
    WTF_CSRF_ENABLED = True
    SECRET_KEY = '3jIUW8AMdlVv3gxJg9cRtkFUsyoK1KlK2+Folt77FEY='
    VIDEO_PATH = '/data/UCF/data/UCF101/Videos'
    HKL_PATH = '/data/UCF/preproc/UCF_all_clips'
    secret_key = 'd*7P==xXSK$8kFM'

class DebugConfig(BasicConfig):
    DEBUG = True

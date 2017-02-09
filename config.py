class BasicConfig(object):
    DEBUG = False
    WTF_CSRF_ENABLED = True
    SECRET_KEY = '3jIUW8AMdlVv3gxJg9cRtkFUsyoK1KlK2+Folt77FEY='

class DebugConfig(BasicConfig):
    DEBUG = True

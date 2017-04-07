from app import init_app 
import os

init_app('config.BasicConfig')

from app import app

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8008)

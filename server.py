#import sys
#import os

#with open('/data/UCF/demo/logs/sysinfo.txt', 'w') as f:
    #f.write(str(sys.version_info[0]) + '\n')
    #f.write(str(sys.path))

from app import init_app 
import os

init_app('config.BasicConfig')

from app import app

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8007)

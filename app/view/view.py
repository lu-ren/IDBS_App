from flask import Blueprint, render_template
from app import app

index = Blueprint('index', __name__)

@index.route('/', methods=['GET', 'POST'])
def main():
    return render_template('index.html')

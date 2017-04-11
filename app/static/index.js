var videoElement;
var videoNavCanvas;

var canvasObj = {}; //Container for video nav canvas properties

//Data is the list [base64encodedData, videoPath]
function addThumbnails(data) {
    for (let i = 0, len = data.length; i < len; i++) {
        let $elementString = $(createImageElementString(data[i][0]));
        $elementString.on('click', function() { 
            playVideo(data[i][1]); 
        });
        $('.thumbnail-list').append($elementString);
    }
}

function createImageElementString(b64Data) {
    let inner = '\"data:image/png;base64, ' + b64Data + '\"';

    return '<div class=\"col-md-4 thumb\"><a class=\"thumbnail\" href=\"#\"><img src='  
        + inner + '></a></div>';
}

function playVideo(videoPath) {
    videoElement.src = videoPath;
    videoElement.load();
}

function mouseDown(e) {
    let pos = getMousePosition(e);

    videoNavCanvas.style.cursor = 'crosshair';
    canvasObj.isDrawing = true;
    canvasObj.startX = pos.x;
    canvasObj.startY = pos.y;
}

function mouseMove(e) {
    if (canvasObj.isDrawing) {
        let pos = getMousePosition(e);
        let width = pos.x - canvasObj.startX;
        let height = pos.y - canvasObj.startY;

        canvasObj.ctx.clearRect(0, 0, videoNavCanvas.width, videoNavCanvas.height);
        canvasObj.ctx.beginPath();
        canvasObj.ctx.fillRect(canvasObj.startX, canvasObj.startY,
            width, height);
    }
}

function mouseUp() {
    canvasObj.isDrawing = false;
    videoNavCanvas.style.cursor = 'default';
}

function getMousePosition(e) {
    var rect = videoNavCanvas.getBoundingClientRect(),
        scaleX = videoNavCanvas.width / rect.width,
        scaleY = videoNavCanvas.height / rect.height;

    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

function setup() {
    $(document).ready(function () {
        videoNavCanvas = $('canvas')[0];
        videoElement = $('video')[0];
        videoElement.autoplay = true;

        addThumbnails(videoData);

        //Setting up the video nav bar
        canvasObj.ctx = videoNavCanvas.getContext('2d');
        canvasObj.ctx.fillStyle = '#39acdd';
        canvasObj.isDrawing = false;

        $('canvas').on('mousedown', function(e) {
            mouseDown(e);
        }).on('mouseup', function(e) {
            mouseUp();
        }).on('mousemove', function(e) {
            mouseMove(e);
        });
    });
}

$('.browser-sidebar').on('scroll', function() {
    if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
        let xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                let newVideoData = JSON.parse(xhr.responseText);
                addThumbnails(newVideoData);
            }
        };

        xhr.open('GET', 'http://larsde.cs.columbia.edu:8008/loadimage');
        xhr.send(null);
    }
});

setup();

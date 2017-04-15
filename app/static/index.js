var videoPlayer;
var videoNavCanvas;

var canvasObj = {}; //Container for video nav canvas properties

var queries = [];

var url = 'http://larsde.cs.columbia.edu:8008';
var testingUrl = 'http://larsde.cs.columbia.edu:8007';

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
    videoPlayer.src(videoPath);
    videoPlayer.load();

    canvasObj.hasVideo = false;
    //Pixels per second
    videoPlayer.ready(function() {
        this.on('loadedmetadata', function() {
            let xhr = new XMLHttpRequest(); //Getting the fps of video from server

            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    let videoMetaObj = JSON.parse(xhr.responseText);
                    canvasObj.ctx.clearRect(0, 0, videoNavCanvas.width, videoNavCanvas.height);
                    canvasObj.pps = Math.floor(videoNavCanvas.width / videoPlayer.duration());
                    canvasObj.fps = videoMetaObj.fps;
                    canvasObj.hasVideo = true;
                    $('button').prop('disabled', true);
                }
            }

            xhr.open('POST', url + '/videometadata');
            xhr.send(videoPath);
        });
    });
}

function mouseDown(e) {
    if (canvasObj.hasVideo) {
        let pos = getMousePosition(e);

        videoNavCanvas.style.cursor = 'crosshair';
        canvasObj.isDrawing = true;
        canvasObj.startX = pos.x;
    }
}

function mouseMove(e) {
    if (canvasObj.isDrawing) {
        let pos = getMousePosition(e);
        let width = pos.x - canvasObj.startX;

        canvasObj.ctx.clearRect(0, 0, videoNavCanvas.width, videoNavCanvas.height);
        canvasObj.ctx.beginPath();
        canvasObj.ctx.fillRect(canvasObj.startX, 0,
            width, videoNavCanvas.height);

        //Calculate seek position in video
        let seconds = getSecondsFromVideo(pos);
        videoPlayer.currentTime(seconds);
    }
}

function mouseUp() {
    canvasObj.isDrawing = false;
    videoNavCanvas.style.cursor = 'default';
    videoPlayer.pause();
    $('button').prop('disabled', false);
}

function getSecondsFromVideo(pos) {
    return (pos.x / videoNavCanvas.width) * videoPlayer.duration();
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

function generateThumbnailFromVideo(positivity) {
    positivity = positivity || 'positive';
    let canvas = document.createElement('canvas');
    canvas.width = videoNavCanvas.width;
    canvas.height = videoNavCanvas.height;
    canvas.getContext('2d')
        .drawImage($('video')[0], 0, 0, canvas.width, canvas.height);
    let $elementString = $('<div class=\"col-md-4 thumb\"><a class=\"thumbnail\" href=\"#\"><img src=\"'
        + canvas.toDataURL() + '\"></img></a></div>');

    if (positivity === 'positive') {
        $elementString.find('a').css('background-color', 'rgba(0, 0, 255, 0.5)');
    } else {
        $elementString.find('a').css('background-color', 'rgba(255, 0, 0, 0.5');
    }

    $elementString.on('click', function() {
        $(this).remove();
    });
    $('.query-list').append($elementString);
}

function setup() {
    $(document).ready(function () {
        videoNavCanvas = $('canvas')[0];
        videoPlayer = videojs('video-player');
        videoPlayer.autoplay(true);

        addThumbnails(videoData);

        //Setting up the video nav bar
        canvasObj.ctx = videoNavCanvas.getContext('2d');
        canvasObj.ctx.fillStyle = '#1687c9';
        canvasObj.isDrawing = false;

        $('canvas').on('mousedown', function(e) {
            mouseDown(e);
        }).on('mouseup', function(e) {
            mouseUp();
        }).on('mousemove', function(e) {
            mouseMove(e);
        });

        $('.positive-btn').on('click', function() {
            generateThumbnailFromVideo('positive');
        });

        $('.negative-btn').on('click', function() {
            generateThumbnailFromVideo('negative');
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

        xhr.open('GET', url + '/loadimage');
        xhr.send(null);
    }
});

setup();

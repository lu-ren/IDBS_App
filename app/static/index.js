var brush; //d3 brush
var brushMap = {};
var tmpStartFrame;
var tmpEndFrame;
var testingUrl = 'http://larsde.cs.columbia.edu:8007';
var url = 'http://larsde.cs.columbia.edu:8008';
var submittedQuery = false;
var videoPlayer;

//Data is the list [base64encodedData, videoPath]
function addThumbnails(data) {
    for (let i = 0, len = data.length; i < len; i++) {
        let $elementString = $(createImageElementString(data[i][0]));

        $elementString.on('click', function() { 
            let startFrame = data[i][2] || 0;
            playVideo(data[i][1], startFrame); 
        });

        $('.thumbnail-list').append($elementString);
    }
}

function createImageElementString(b64Data) {
    let inner = '\"data:image/png;base64, ' + b64Data + '\"';

    return '<div class=\"col-md-4 thumb\"><a class=\"thumbnail\" href=\"#\"><img src='  
        + inner + '></a></div>';
}

function playVideo(videoPath, sf) {
    videoPlayer.src(videoPath);

    let xhr = new XMLHttpRequest(); //Getting the fps of video from server

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            let videoMetaObj = JSON.parse(xhr.responseText);
            brushMap.fps = videoMetaObj.fps;
            $('button').prop('disabled', true);

            if (sf > 0) {
                let seconds = sf * (1 / brushMap.fps);
                videoPlayer.ready(function() {
                    videoPlayer.currentTime(seconds);
                });
            }
        }
    };

    xhr.open('POST', url + '/videometadata');
    xhr.send(videoPath);
}

function mouseMove() {
    let x2 = brush.extent()[1];
    let seconds = (x2 / 100) * videoPlayer.duration();
    videoPlayer.currentTime(seconds);
}

function mouseUp() {
    let x = brush.extent();
    let startSeconds = (x[0] / 100) * videoPlayer.duration();
    let endSeconds = (x[1] / 100) * videoPlayer.duration();
    tmpStartFrame = Math.floor(startSeconds * brushMap.fps);
    tmpEndFrame = Math.floor(endSeconds * brushMap.fps);
    videoPlayer.pause();
    $('button').prop('disabled', false);
}

function generateThumbnailFromVideo(positivity) {
    positivity = positivity || 'positive';
    let canvas = document.createElement('canvas');
    canvas.getContext('2d')
        .drawImage($('video')[0], 0, 0, canvas.width, canvas.height);

    let $closeBtn = $('<button class=\"close-btn\" type=\"button\">x</button>');
    let $a = $('<a class=\"thumbnail\" href=\"#\"></a>');
    let $img = $('<img src=\"' +  canvas.toDataURL() + '\"></img');
    let $thumbnail = $('<div class=\"col-md-4 thumb\"></div>');

    $a.append($closeBtn);
    $a.append($img);
    $thumbnail.append($a);

    $thumbnail.attr('data-videoName', getNameFromPath(videoPlayer.src()));
    $thumbnail.attr('data-videoPath', videoPlayer.src());
    $thumbnail.attr('data-startFrame', tmpStartFrame);
    $thumbnail.attr('data-endFrame', tmpEndFrame);

    if (positivity === 'positive') {
        $a.css('background-color', 'rgba(0, 0, 255, 0.3');
        $thumbnail.attr('data-positivity', 1);
    } else {
        $a.css('background-color', 'rgba(255, 0, 0, 0.3');
        $thumbnail.attr('data-positivity', 0);
    }

    $closeBtn.on('click', function() {
        $(this).parent().closest('.thumb').remove();
    });

    $a.on('click', function() {
        let startFrame = $(this).parent().closest('.thumb').attr('data-startFrame');
        let videoPath = $(this).parent().closest('.thumb').attr('data-videoPath');
        videoPath = videoPath.replace(url, '');
        playVideo(videoPath, startFrame);
    });

    $('.query-list').append($thumbnail);
}

function getNameFromPath(filePath) {
    return filePath.split('/').pop();
}

function setup() {
    $(document).ready(function () {
        videoPlayer = videojs('video-player');
        videoPlayer.autoplay(true);

        addThumbnails(videoData);
        
        //Setting up D3 brush
        var svg = d3.select('svg');
        var scale = d3.scale.linear()
            .domain([0, 100]).range([0, 500]);
        brush = d3.svg.brush();
        brush.x(scale);
        brush.extent([22, 28]);

        brush.on('brush', function() {
            mouseMove();
        }).on('brushend', function() {
            mouseUp();
        });

        var g = svg.append('g');

        brush(g);

        g.attr('transform', 'translate(50, 50)');
        g.selectAll('rect').attr('height', 30);
        g.selectAll('.background')
            .style({ fill: '#4b9e9e', visibility: 'visible' });
        g.selectAll('.extent')
            .style({ fill: '#78c5c5', visibility: 'visible' });
        g.selectAll('.resize rect')
            .style({ fill: '#276c86', visibility: 'visible' });

        $('.positive-btn').on('click', function() {
            generateThumbnailFromVideo('positive');
        });

        $('.negative-btn').on('click', function() {
            generateThumbnailFromVideo('negative');
        });

        $('.submit-btn').on('click', function() {
            let xhr = new XMLHttpRequest();

            if ($('.query-list').length) {
                let thumbnails = $('.query-list').children();
                let queries = [];

                for (let i = 0; i < thumbnails.length; i++) {
                    let t = thumbnails[i];
                    queries.push([t.getAttribute('data-videoName'), t.getAttribute('data-startFrame'),
                        t.getAttribute('data-endFrame'), t.getAttribute('data-positivity')]);
                }

                xhr.onreadystatechange = function() {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        let newVideoData = JSON.parse(xhr.responseText);
                        submittedQuery = true;
                        $('.thumbnail-list').empty();
                        addThumbnails(newVideoData);
                    }
                };
                xhr.open('POST', url + '/submitquery');
                xhr.send(JSON.stringify(queries));
            }
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
        
        if (submittedQuery) {
            xhr.open('GET', url + '/loadqueryimage');
        } else {
            xhr.open('GET', url + '/loadimage');
        }
        xhr.send(null);
    }
});

setup();

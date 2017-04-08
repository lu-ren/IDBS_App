//Data is the list [base64encodedData, videoPath]
function addThumbnails(data) {
    var $thumbnailList = $('.thumbnail-list');

    for (let i = 0, len = data.length; i < len; i++) {
        let elementString = createImageElementString(data[i][0]);
        $thumbnailList.append(elementString).on('click', 'a', function() {
            alert(i);
        });
    }
}

function createImageElementString(b64Data) {
    let inner = '\"data:image/png;base64, ' + b64Data + '\"';

    return '<div class=\"col-md-4 thumb\"><a class=\"thumbnail\" href=\"#\"><img src='  
        + inner + '></a></div>';
}

function playVideo(videoPath) {
    let sourceElement = '<source src=\"' + videoPath + '\" type=video/avi>';

    if ($('video').find('source').length) {
        $('video').append(sourceElement);
    } else {
        $('video.source').replaceWith(sourceElement);
    }
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

addThumbnails(videoData);

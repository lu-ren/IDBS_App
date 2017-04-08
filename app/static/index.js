function createThumbnailList() {
    var $thumbnailList = $('.thumbnail-list');

    for (let i = 0, len = videoData.length; i < len; i++) {
        let elementString = createImageElementString(videoData[i][0]);
        $thumbnailList.append(elementString);
    }
}

function createImageElementString(b64Data) {
    let inner = '\"data:image/png;base64, ' + b64Data + '\"';

    return '<div class=\"col-md-4 thumb\"><a class=\"thumbnail\" href=\"#\"><img src='  
        + inner + '></a></div>';
}

$('.browser-sidebar').on('scroll', function() {
    if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
        let xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function() {
            if (xhr.readState === XMLHttpRequest.DONE) {
                let newVideoData = JSON.parse(xhr.responseText);
            }
        };

        xhr.open('GET', 'http://larsde.cs.columbia.edu:8008/loadimage');
        xhr.send(null);
    }
});
createThumbnailList();

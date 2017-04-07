function createThumbnailList() {
    var $thumbnailList = $('.thumbnail-list');

    for (let i = 0, len = videoData.length; i < len; i++) {
        let elementString = createImageElementString(videoData[i][0]);
        $thumbnailList.append(elementString);
    }
}

function createImageElementString(b64Data) {
    let inner = '\"data:image/png;base64, ' + b64Data + '\"';
    return '<li><img src='  + inner + '></li>';
}

createThumbnailList();

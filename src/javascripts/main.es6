
var localVideo = document.getElementById('local-video');
var remoteVideo = document.getElementById('remote-video');
var connector = new WebRTCConnector(localVideo, remoteVideo, getRoomName());

function getRoomName() { // たとえば、 URLに  ?roomname  とする
    var url = document.location.href;
    var args = url.split('?');
    if (args.length > 1) {
        var room = args[1];
        if (room != "") {
            return room;
        }
    }
    return "_defaultroom";
}

document.getElementById("start-button").addEventListener("click", function(){
    connector.startVideo();
});

document.getElementById("stop-button").addEventListener("click", function(){
    connector.stopVideo();
});

document.getElementById("connect-button").addEventListener("click", function(){
    connector.connect();
});

document.getElementById("hangup-button").addEventListener("click", function(){
    connector.hangUp();
});
class WebRTCConnector {

    constructor(localVideo, remoteVideo) {
        this.localStream = null;
        this.peerConnection = null;
        this.peerStarted = false;
        this.mediaConstraints = {'mandatory': {'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true}};
        this.localVideo = localVideo;
        this.remoteVideo = remoteVideo;

        // ---- socket ------
        // create socket
        this.socketReady = false;
        this.socket = io.connect(location.origin);
        // socket: channel connected
        this.socket.on('connect', (evt)=>{
            console.log('socket opened.');
            this.socketReady = true;

            var roomname = this.getRoomName(); // 会議室名を取得する
            this.socket.emit('enter', roomname);
        });
        this.socket.on('message', (evt)=>{
            if (evt.type === 'offer') {
                console.log("Received offer, set offer, sending answer....")
                this.onOffer(evt);
            } else if (evt.type === 'answer' && this.peerStarted) {
                console.log('Received answer, settinng answer SDP');
                this.onAnswer(evt);
            } else if (evt.type === 'candidate' && this.peerStarted) {
                console.log('Received ICE candidate...');
                this.onCandidate(evt);
            } else if (evt.type === 'user dissconnected' && this.peerStarted) {
                console.log("disconnected");
                this.hangUp();
            }
        });
    }

    // ---------------------- video handling -----------------------
    // start local video
    startVideo() {
        navigator.webkitGetUserMedia({video: true, audio: true},
            (stream)=>{ // success
                this.localStream = stream;
                this.localVideo.src = window.URL.createObjectURL(stream);
                this.localVideo.play();
                this.localVideo.volume = 0;
            },
            (error)=>{ // error
                console.error('An error occurred: [CODE ' + error.code + ']');
                return;
            }
        );
    }

    // stop local video
    stopVideo() {
        this.localVideo.src = "";
        this.localStream.stop();
    }


    // -------- handling user UI event -----
    // start the connection upon user request
    connect() {
        if (!this.peerStarted && this.localStream && this.socketReady) {
            this.peerConnection = this.prepareNewConnection();
            this.peerConnection.createOffer((sessionDescription)=>{ // in case of success
                this.peerConnection.setLocalDescription(sessionDescription);
                console.log("Sending: SDP");
                console.log(sessionDescription);
                this.socket.json.send(sessionDescription);
            }, function () { // in case of error
                console.log("Create Offer failed");
            }, this.mediaConstraints);
            this.peerStarted = true;
        } else {
            alert("Local stream not running yet - try again.");
        }
    }

    // ---------------------- connection handling -----------------------
    prepareNewConnection() {
        var pc_config = {"iceServers": []}; //ここにSTUN/TURNサーバーの設定を入れる
        var peer = null;
        try {
            peer = new webkitRTCPeerConnection(pc_config);
        } catch (e) {
            console.log("Failed to create peerConnection, exception: " + e.message);
        }

        // send any ice candidates to the other peer
        peer.onicecandidate = (evt)=>{
            if (evt.candidate) {
                console.log(evt.candidate);
                var candidate = {
                    type: "candidate",
                    sdpMLineIndex: evt.candidate.sdpMLineIndex,
                    sdpMid: evt.candidate.sdpMid,
                    candidate: evt.candidate.candidate
                };
                this.socket.json.send(candidate);
            } else {
                console.log("End of candidates. ------------------- phase=" + evt.eventPhase);
            }
        };

        console.log('Adding local stream...');
        peer.addStream(this.localStream);

        peer.addEventListener("addstream", ()=>{
            // when remote adds a stream, hand it on to the local video element
            console.log("Added remote stream");
            this.remoteVideo.src = window.URL.createObjectURL(event.stream);
        }, false);
        peer.addEventListener("removestream", ()=>{
            // when remote removes a stream, remove it from the local video element
            console.log("Remove remote stream");
            this.remoteVideo.src = "";
        }, false)

        return peer;
    }


    onOffer(evt) {
        console.log("Received offer...")
        console.log(evt);

        //set offer
        if (this.peerConnection) {
            console.error('peerConnection alreay exist!');
        }
        this.peerConnection = this.prepareNewConnection();
        this.peerConnection.setRemoteDescription(new RTCSessionDescription(evt));

        //send answer
        console.log('sending Answer. Creating remote session description...');
        if (!this.peerConnection) {
            console.error('peerConnection NOT exist!');
            return;
        }
        this.peerConnection.createAnswer((sessionDescription)=>{ // in case of success
            this.peerConnection.setLocalDescription(sessionDescription);
            console.log("Sending: SDP");
            console.log(sessionDescription);
            this.socket.json.send(sessionDescription);
        }, function () { // in case of error
            console.log("Create Answer failed");
        }, this.mediaConstraints);

        this.peerStarted = true;
    }

    onAnswer(evt) {
        console.log("Received Answer...")
        console.log(evt);

        //set answer
        if (!this.peerConnection) {
            console.error('peerConnection NOT exist!');
            return;
        }
        this.peerConnection.setRemoteDescription(new RTCSessionDescription(evt));
    }

    onCandidate(evt) {
        var candidate = new RTCIceCandidate({
            sdpMLineIndex: evt.sdpMLineIndex,
            sdpMid: evt.sdpMid,
            candidate: evt.candidate
        });
        console.log("Received Candidate...")
        console.log(candidate);
        this.peerConnection.addIceCandidate(candidate);
    }

    // stop the connection upon user request
    hangUp() {
        console.log("Hang up.");
        this.peerConnection.close();
        this.peerConnection = null;
        this.peerStarted = false;
    }

}
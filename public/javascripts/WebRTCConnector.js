'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var WebRTCConnector = (function () {
    function WebRTCConnector(localVideo, remoteVideo, roomname) {
        var _this = this;

        _classCallCheck(this, WebRTCConnector);

        this.localStream = null;
        this.peerConnection = null;
        this.peerStarted = false;
        this.mediaConstraints = { mandatory: { OfferToReceiveAudio: true, OfferToReceiveVideo: true } };
        this.localVideo = localVideo;
        this.remoteVideo = remoteVideo;

        // ---- socket ------
        // create socket
        this.socketReady = false;
        this.socket = io.connect(location.origin);
        // socket: channel connected
        this.socket.on('connect', function (evt) {
            console.log('socket opened.');
            _this.socketReady = true;

            _this.socket.emit('enter', roomname);
        });
        this.socket.on('message', function (evt) {
            if (evt.type === 'offer') {
                console.log('Received offer, set offer, sending answer....');
                _this.onOffer(evt);
            } else if (evt.type === 'answer' && _this.peerStarted) {
                console.log('Received answer, settinng answer SDP');
                _this.onAnswer(evt);
            } else if (evt.type === 'candidate' && _this.peerStarted) {
                console.log('Received ICE candidate...');
                _this.onCandidate(evt);
            } else if (evt.type === 'user dissconnected' && _this.peerStarted) {
                console.log('disconnected');
                _this.hangUp();
            }
        });
    }

    _createClass(WebRTCConnector, [{
        key: 'startVideo',

        // ---------------------- video handling -----------------------
        // start local video
        value: function startVideo() {
            var _this2 = this;

            navigator.webkitGetUserMedia({ video: true, audio: true }, function (stream) {
                // success
                _this2.localStream = stream;
                _this2.localVideo.src = window.URL.createObjectURL(stream);
                _this2.localVideo.play();
                _this2.localVideo.volume = 0;
            }, function (error) {
                // error
                console.error('An error occurred: [CODE ' + error.code + ']');
                return;
            });
        }
    }, {
        key: 'stopVideo',

        // stop local video
        value: function stopVideo() {
            this.localVideo.src = '';
            this.localStream.stop();
        }
    }, {
        key: 'connect',

        // -------- handling user UI event -----
        // start the connection upon user request
        value: function connect() {
            var _this3 = this;

            if (!this.peerStarted && this.localStream && this.socketReady) {
                this.peerConnection = this.prepareNewConnection();
                this.peerConnection.createOffer(function (sessionDescription) {
                    // in case of success
                    _this3.peerConnection.setLocalDescription(sessionDescription);
                    console.log('Sending: SDP');
                    console.log(sessionDescription);
                    _this3.socket.json.send(sessionDescription);
                }, function () {
                    // in case of error
                    console.log('Create Offer failed');
                }, this.mediaConstraints);
                this.peerStarted = true;
            } else {
                alert('Local stream not running yet - try again.');
            }
        }
    }, {
        key: 'prepareNewConnection',

        // ---------------------- connection handling -----------------------
        value: function prepareNewConnection() {
            var _this4 = this;

            var pc_config = { iceServers: [] }; //ここにSTUN/TURNサーバーの設定を入れる
            var peer = null;
            try {
                peer = new webkitRTCPeerConnection(pc_config);
            } catch (e) {
                console.log('Failed to create peerConnection, exception: ' + e.message);
            }

            // send any ice candidates to the other peer
            peer.onicecandidate = function (evt) {
                if (evt.candidate) {
                    console.log(evt.candidate);
                    var candidate = {
                        type: 'candidate',
                        sdpMLineIndex: evt.candidate.sdpMLineIndex,
                        sdpMid: evt.candidate.sdpMid,
                        candidate: evt.candidate.candidate
                    };
                    _this4.socket.json.send(candidate);
                } else {
                    console.log('End of candidates. ------------------- phase=' + evt.eventPhase);
                }
            };

            console.log('Adding local stream...');
            peer.addStream(this.localStream);

            peer.addEventListener('addstream', function () {
                // when remote adds a stream, hand it on to the local video element
                console.log('Added remote stream');
                _this4.remoteVideo.src = window.URL.createObjectURL(event.stream);
            }, false);
            peer.addEventListener('removestream', function () {
                // when remote removes a stream, remove it from the local video element
                console.log('Remove remote stream');
                _this4.remoteVideo.src = '';
            }, false);

            return peer;
        }
    }, {
        key: 'onOffer',
        value: function onOffer(evt) {
            var _this5 = this;

            console.log('Received offer...');
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
            this.peerConnection.createAnswer(function (sessionDescription) {
                // in case of success
                _this5.peerConnection.setLocalDescription(sessionDescription);
                console.log('Sending: SDP');
                console.log(sessionDescription);
                _this5.socket.json.send(sessionDescription);
            }, function () {
                // in case of error
                console.log('Create Answer failed');
            }, this.mediaConstraints);

            this.peerStarted = true;
        }
    }, {
        key: 'onAnswer',
        value: function onAnswer(evt) {
            console.log('Received Answer...');
            console.log(evt);

            //set answer
            if (!this.peerConnection) {
                console.error('peerConnection NOT exist!');
                return;
            }
            this.peerConnection.setRemoteDescription(new RTCSessionDescription(evt));
        }
    }, {
        key: 'onCandidate',
        value: function onCandidate(evt) {
            var candidate = new RTCIceCandidate({
                sdpMLineIndex: evt.sdpMLineIndex,
                sdpMid: evt.sdpMid,
                candidate: evt.candidate
            });
            console.log('Received Candidate...');
            console.log(candidate);
            this.peerConnection.addIceCandidate(candidate);
        }
    }, {
        key: 'hangUp',

        // stop the connection upon user request
        value: function hangUp() {
            console.log('Hang up.');
            this.peerConnection.close();
            this.peerConnection = null;
            this.peerStarted = false;
        }
    }]);

    return WebRTCConnector;
})();
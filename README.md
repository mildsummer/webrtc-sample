# webrtc-sample

### 参考・元ソース
<https://html5experts.jp/series/webrtc-beginner/>

### WebRTCとは
* カメラ、マイクといったメディアへのアクセス(UserMedia)
* Peer-to-Peer通信を行うための仕組み(RTCPeerConnection)

#### P2P通信を行うためにブラウザ間でやりとりする情報

##### Session Description Protocol (SDP)

各ブラウザの情報を示し、文字列で表現されます。例えば次のような情報を含んでいます。

* セッションが含むメディアの種類（音声、映像）、メディアの形式（コーデック）
* IPアドレス、ポート番号
* P2Pのデータ転送プロトコル → WebRTCでは Secure RTP
* 通信で使用する帯域

##### Interactive Connectivity Establishment (ICE)

可能性のある通信経路に関する情報を示し、文字列で表現されます。次のような複数の経路を候補としてリストアップします。

* P2Pによる直接通信
* STUNによる、NAT通過のためのポートマッピング → 最終的にはP2Pになる
* TURNによる、リレーサーバーを介した中継通信

候補が出そろったら、ネットワーク的に近い経路（オーバーヘッドの少ない経路）が選択されます。リストの上から順に優先です。

#### コードの雰囲気

RTCPeerConnectionにSDPやICEをもらい、socketを通して交換（シグナリング）、セットすることで通信が確立されます。
![シグナリング１](/signaling_sdp.png)
![シグナリング２](/signaling_ice.png)

#### SDPの例

    {
        sdp: "v=0
        ↵o=- 8797826464936016491 2 IN IP4 127.0.0.1
        ↵s=-
        ↵t=0 0
        ↵a=group:BUNDLE audio video
        ↵a=msid-semantic: WMS kWSG7Nry3L9TmmQ1tspMAEfTx0FBdO28cAHg
        ↵m=audio 9 RTP/SAVPF 111 103 104 9 0 8 106 105 13 126
        ↵c=IN IP4 0.0.0.0
        ↵a=rtcp:9 IN IP4 0.0.0.0
        ↵a=ice-ufrag:dRQQBsl5lnG2SOJG
        ↵a=ice-pwd:I7jPly8S6CKwa3F0XD1VhnC/
        ↵a=fingerprint:sha-256 40:9F:D8:31:80:7A:D8:47:96:35:AC:28:3B:2C:18:CA:38:D8:28:C7:A3:12:0D:A0:E6:A6:A2:9B:FC:13:80:16
        ↵a=setup:actpass
        ↵a=mid:audio
        ↵a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level
        ↵a=extmap:3 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
        ↵a=sendrecv
        ↵a=rtcp-mux
        ↵a=rtpmap:111 opus/48000/2
        ↵a=fmtp:111 minptime=10; useinbandfec=1
        ↵a=rtpmap:103 ISAC/16000
        ↵a=rtpmap:104 ISAC/32000
        ↵a=rtpmap:9 G722/8000
        ↵a=rtpmap:0 PCMU/8000
        ↵a=rtpmap:8 PCMA/8000
        ↵a=rtpmap:106 CN/32000
        ↵a=rtpmap:105 CN/16000
        ↵a=rtpmap:13 CN/8000
        ↵a=rtpmap:126 telephone-event/8000
        ↵a=maxptime:60
        ↵a=ssrc:4012966773 cname:hZkYtZeoBGbhwfCx
        ↵a=ssrc:4012966773 msid:kWSG7Nry3L9TmmQ1tspMAEfTx0FBdO28cAHg ee59fa2c-1382-40ff-bce1-02cacad5e154
        ↵a=ssrc:4012966773 mslabel:kWSG7Nry3L9TmmQ1tspMAEfTx0FBdO28cAHg
        ↵a=ssrc:4012966773 label:ee59fa2c-1382-40ff-bce1-02cacad5e154
        ↵m=video 9 RTP/SAVPF 100 116 117 96
        ↵c=IN IP4 0.0.0.0
        ↵a=rtcp:9 IN IP4 0.0.0.0
        ↵a=ice-ufrag:dRQQBsl5lnG2SOJG
        ↵a=ice-pwd:I7jPly8S6CKwa3F0XD1VhnC/
        ↵a=fingerprint:sha-256 40:9F:D8:31:80:7A:D8:47:96:35:AC:28:3B:2C:18:CA:38:D8:28:C7:A3:12:0D:A0:E6:A6:A2:9B:FC:13:80:16
        ↵a=setup:actpass
        ↵a=mid:video
        ↵a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
        ↵a=extmap:3 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
        ↵a=sendrecv
        ↵a=rtcp-mux
        ↵a=rtpmap:100 VP8/90000
        ↵a=rtcp-fb:100 ccm fir
        ↵a=rtcp-fb:100 nack
        ↵a=rtcp-fb:100 nack pli
        ↵a=rtcp-fb:100 goog-remb
        ↵a=rtpmap:116 red/90000
        ↵a=rtpmap:117 ulpfec/90000
        ↵a=rtpmap:96 rtx/90000
        ↵a=fmtp:96 apt=100
        ↵a=ssrc-group:FID 3634141298 169848578
        ↵a=ssrc:3634141298 cname:hZkYtZeoBGbhwfCx
        ↵a=ssrc:3634141298 msid:kWSG7Nry3L9TmmQ1tspMAEfTx0FBdO28cAHg 01d44558-b613-4a02-bd5c-4cb38b9294ca
        ↵a=ssrc:3634141298 mslabel:kWSG7Nry3L9TmmQ1tspMAEfTx0FBdO28cAHg
        ↵a=ssrc:3634141298 label:01d44558-b613-4a02-bd5c-4cb38b9294ca
        ↵a=ssrc:169848578 cname:hZkYtZeoBGbhwfCx
        ↵a=ssrc:169848578 msid:kWSG7Nry3L9TmmQ1tspMAEfTx0FBdO28cAHg 01d44558-b613-4a02-bd5c-4cb38b9294ca
        ↵a=ssrc:169848578 mslabel:kWSG7Nry3L9TmmQ1tspMAEfTx0FBdO28cAHg
        ↵a=ssrc:169848578 label:01d44558-b613-4a02-bd5c-4cb38b9294ca
        ↵"
        type: "offer"
    }

#### ICEの例
複数交換される

    {
        sdpMLineIndex: 1,
        sdpMid: "video",
        candidate: "candidate:3732253097 2 udp 2122260223 10.2.0.41 58282 typ host generation 0"
    }
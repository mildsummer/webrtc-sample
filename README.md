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

候補が出そろったら、ネットワーク的に近い経路（オーバーヘッドの少ない経路）が選択されます。リストの上から順に優先です。※STUNやTURNについては、別の回で触れたいと思います。

#### コードの雰囲気

RTCPeerConnectionにSDPやICEをもらい、socketを通して交換（シグナリング）、セットすることで通信が確立される。
![シグナリング１](/signaling_sdp.png)
![シグナリング２](/signaling_ice.png)

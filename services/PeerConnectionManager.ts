import iceConf from '../confs/iceConf'
import Logger from '../lib/Logger'

// PeerConnectionをここから外で直接操作しない
// Firestoreに依存しない
export default class PeerConnectionManager {
  private myId: string;
  private peerConnections: { [key: string]: RTCPeerConnection };
  private remoteStreams: { userId: string, stream: MediaStream }[] = [];
  private setRemoteStreams: (remoteStreams: {
    userId: string;
    stream: MediaStream;
  }[]) => void;
  private localStream: MediaStream;
  private storeIceCandidate: (myId: string, targetUserId: string, json: RTCIceCandidateInit) => void;

  constructor(
    mediaStream: MediaStream,
    setRemoteStreams: (remoteStreams: {
      userId: string;
      stream: MediaStream;
    }[]) => void,
    storeIceCandidate: (myId: string, targetUserId: string, json: RTCIceCandidateInit) => void
  ) {
    this.peerConnections = {};
    this.localStream = mediaStream;
    this.setRemoteStreams = setRemoteStreams;
    this.storeIceCandidate = storeIceCandidate;
  }

  // connection は必ずここで作成する
  createConnection(targetUserId: string): RTCPeerConnection {
    const peerConnection = new RTCPeerConnection(iceConf);

    // リスナー追加
    this.registerPeerConnectionListeners(peerConnection, targetUserId);

    // Add local stream to a connection
    this.localStream.getTracks().forEach((track) => {
      Logger.debug("Set local track:", this.localStream);
      peerConnection.addTrack(track, this.localStream);
    });

    // Get a remote stream from a connection
    const remoteStream = new MediaStream();
    peerConnection.addEventListener("track", (event) => {
      Logger.debug(`Got remote track to ${targetUserId}:`, event.streams[0]);
      event.streams[0].getTracks().forEach((track) => {
        Logger.debug(`Add a track to the remoteStream to ${targetUserId}:`, track);
        remoteStream.addTrack(track);
      });
    });
    this.remoteStreams.push({ userId: targetUserId, stream: remoteStream });
    this.setRemoteStreams(this.remoteStreams);

    // ICE候補収集(見つかる度に都度追加)
    peerConnection.addEventListener("icecandidate", (event) => {
      Logger.debug("Found local icecandidate: ", event);
      if (event.candidate) {
        // 候補が見つかったとき
        const json = event.candidate.toJSON();
        // Firestoreへ保存
        this.storeIceCandidate(this.myId, targetUserId, json);
      }
    });

    return peerConnection;
  }

  // TODO: 要検討
  setMyId(myId: string) {
    this.myId = myId;
  }

  closeAll() {
    Logger.debug("Close all connections");
    Object.values(this.peerConnections).forEach(data => {
      data.close();
    })
  }

  // 探してなければ新規作成
  findOrCreateBy(targetUserId: string): RTCPeerConnection {
    if (targetUserId in this.peerConnections) {
      return this.peerConnections[targetUserId];
    }
    const peerConnection = this.createConnection(targetUserId);
    this.addConnection(peerConnection, targetUserId);
    return peerConnection;
  }

  // collectionに追加
  private addConnection(peerConnection: RTCPeerConnection, targetUserId: string): void {
    this.peerConnections[targetUserId] = peerConnection;
  }

  // イベントリスナー追加
  private registerPeerConnectionListeners(peerConnection: RTCPeerConnection, targetUserId: string): void {
    peerConnection.addEventListener("icegatheringstatechange", () => {
      Logger.debug(
        `ICE gathering state to ${targetUserId} changed: ${peerConnection.iceGatheringState}`
      );
    });

    peerConnection.addEventListener("connectionstatechange", () => {
      Logger.debug(`Connection state to ${targetUserId} change: ${peerConnection.connectionState}`);
    });

    peerConnection.addEventListener("signalingstatechange", () => {
      Logger.debug(`Signaling state to ${targetUserId} change: ${peerConnection.signalingState}`);
    });

    peerConnection.addEventListener("iceconnectionstatechange ", () => {
      Logger.debug(
        `ICE connection state to ${targetUserId} change: ${peerConnection.iceConnectionState}`
      );
    });
  }
}
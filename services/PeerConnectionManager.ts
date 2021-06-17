import iceConf from '../confs/iceConf'

export default class PeerConnectionManager {
  private peerConnections: { [key: string]: RTCPeerConnection };

  constructor() {
    this.peerConnections = {};
  }

  findOrCreateBy(targetUserId: string): RTCPeerConnection {
    if (targetUserId in this.peerConnections) {
      return this.peerConnections[targetUserId];
    }
    const peerConnection = new RTCPeerConnection(iceConf);
    this.addConnection(peerConnection, targetUserId);
    return peerConnection;
  }

  private addConnection(peerConnection: RTCPeerConnection, targetUserId: string): void {
    this.peerConnections[targetUserId] = peerConnection;
    this.registerPeerConnectionListeners(peerConnection, targetUserId);
  }

  private registerPeerConnectionListeners(peerConnection: RTCPeerConnection, targetUserId: string): void {
    peerConnection.addEventListener("icegatheringstatechange", () => {
      console.log(
        `ICE gathering state to ${targetUserId} changed: ${peerConnection.iceGatheringState}`
      );
    });

    peerConnection.addEventListener("connectionstatechange", () => {
      console.log(`Connection state to ${targetUserId} change: ${peerConnection.connectionState}`);
    });

    peerConnection.addEventListener("signalingstatechange", () => {
      console.log(`Signaling state to ${targetUserId} change: ${peerConnection.signalingState}`);
    });

    peerConnection.addEventListener("iceconnectionstatechange ", () => {
      console.log(
        `ICE connection state to ${targetUserId} change: ${peerConnection.iceConnectionState}`
      );
    });
  }
}
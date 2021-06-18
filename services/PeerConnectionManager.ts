import iceConf from '../confs/iceConf'
import Logger from '../lib/Logger'

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
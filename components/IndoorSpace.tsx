import { useEffect, useState } from 'react';
import firebase from '../lib/Firebase';
import Logger from '../lib/Logger'
import PeerConnectionManager from '../services/PeerConnectionManager'

// 1. Add myself to room
// 2. Check how many users already exist and send offer
// 3. Listen for offers, answers and ICE candidates
// 4. Exchage each streams
const IndoorSpace = ({ doc, mediaStream }: { doc: firebase.firestore.DocumentSnapshot, mediaStream: MediaStream }) => {
  const [myId, setMyId] = useState<string>(undefined);
  const [existingUserIds, setexistingUserIds] = useState<string[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<{ userId: string, stream: MediaStream }[]>([]);
  const replaceRemoteStreams = (remoteStreams: { userId: string, stream: MediaStream }[]) => {
    const copiesStreams = [...remoteStreams];
    setRemoteStreams(copiesStreams);
  };
  const roomRef = doc.ref;
  const storeIceCandidate = (myId: string, targetUserId: string, json: RTCIceCandidateInit) => {
    if (myId == undefined) {
      Logger.error("My id must be string");
      return;
    }
    const candidateInfo = {
      data: json,
      from: myId
    };
    Logger.debug("Store ice candidate: ", candidateInfo);
    roomRef.collection("users").doc(`${targetUserId}`).collection("candidates").add(candidateInfo).then((doc) => {
      Logger.debug(`Store canditate date to ${targetUserId}`, doc);
    })
  };
  const [peerConnectionManager] = useState<PeerConnectionManager>(
    new PeerConnectionManager(mediaStream, replaceRemoteStreams, storeIceCandidate)
  );
  peerConnectionManager.setMyId(myId);

  // Add self to room
  useEffect(() => {
    // TODO: リロード時はlocalに保存してあるIDから復元したい(or delete deplicated user)
    roomRef.collection("users").add({}).then((userDoc) => {
      Logger.debug("Added me to room: ", userDoc.id);
      setMyId(userDoc.id);
    })

    return () => {
      Logger.debug("Stop all streams and close all connections");
      // Stop media streams
      mediaStream.getTracks().forEach(function (track) {
        track.stop();
      });

      remoteStreams.forEach(data => {
        data.stream.getTracks().forEach(function (track) {
          track.stop();
        });
      })

      // Close connections
      peerConnectionManager.closeAll();
    };
  }, [doc]);

  // fetch already users (depend on my id)
  useEffect(() => {
    if (myId == undefined) return;
    roomRef.collection("users").get().then((usersDoc) => {
      const ids = usersDoc.docs.map(userDoc => userDoc.id).filter(id => id != myId);
      setexistingUserIds(ids);
      Logger.debug("fetched userIds: ", ids);
    })

    return () => {
      // delete self from rooms
      roomRef.collection("users").doc(`${myId}`).delete().then(() => {
        Logger.debug(`Myself(${myId}) successfully deleted from room!`);
      }).catch((error) => {
        Logger.debug("Error removing myself from room: ", error);
      });
    };
  }, [myId]);

  // 1. listen to offers to me and answer to offer (depend on my id)
  // 2. listen to answers to me and set local
  // 3. Listen to ICE candidates
  useEffect(() => {
    if (myId == undefined) return;
    // listen to offers
    const unsubscribeOffers = roomRef.collection("users").doc(`${myId}`).collection("offers").onSnapshot(async (offers) => {
      Logger.debug("Got updated offers:", offers.docs);
      offers.docs.forEach(offerDoc => {
        const offer = offerDoc.data().offer;
        Logger.debug("A offer to me: ", offer);
        const peerConnection = peerConnectionManager.findOrCreateBy(`${offer.from}`);
        peerConnection.setRemoteDescription(offer); // Offer SDP を RemoteDescription にセット

        // send answer
        peerConnection.createAnswer().then((answer) => {
          peerConnection.setLocalDescription(answer); // 生成した Answer SDP を LocalDescription にセット
          const answerInfo = {
            answer: {
              type: answer.type,
              sdp: answer.sdp,
              from: myId
            },
          };
          Logger.debug("Post answer SDP: ", answerInfo);
          roomRef.collection("users").doc(`${offer.from}`).collection("answers").add(answerInfo).then((doc) => {
            Logger.debug(doc);
          })
        });
      });
    });

    // listen to answers
    const unsubscribeAnswers = roomRef.collection("users").doc(`${myId}`).collection("answers").onSnapshot(async (answers) => {
      answers.docs.forEach(answerDoc => {
        const answer = answerDoc.data().answer;
        Logger.debug("A answer to me: ", answer);
        const peerConnection = peerConnectionManager.findOrCreateBy(`${answer.from}`);
        peerConnection.setRemoteDescription(answer); // Answer SDP を RemoteDescription にセット
      });
    });

    // リモートピアから追加されたICE候補をリッスンして、 RTCPeerConnectionインスタンスに追加
    const unsubscribeIceCandidates = roomRef.collection("users").doc(`${myId}`).collection("candidates").onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data().data;
          const from = change.doc.data().from;
          const candidate = new RTCIceCandidate(data);
          Logger.debug(`Set remote RTCIceCandidate from ${from}: `, candidate);
          const peerConnection = peerConnectionManager.findOrCreateBy(`${from}`);
          peerConnection.addIceCandidate(candidate);
        }
      });
    });

    return function cleanup() {
      // Unsubscribe
      unsubscribeOffers();
      unsubscribeAnswers();
      unsubscribeIceCandidates();
    };
  }, [myId]);

  // send offer SDPs (depend on existingUserIds)
  useEffect(() => {
    existingUserIds.forEach(targetId => {
      const peerConnection = peerConnectionManager.findOrCreateBy(targetId);
      peerConnection.createOffer().then((offer) => {
        const offerInfo = {
          offer: {
            type: offer.type,
            sdp: offer.sdp,
            from: myId
          }
        };
        Logger.debug("Post offer SDP: ", offerInfo);
        roomRef.collection("users").doc(`${targetId}`).collection("offers").add(offerInfo).then((doc) => {
          Logger.debug(doc);
        })

        peerConnection.setLocalDescription(offer); // 生成した Offer SDP を LocalDescription にセット
      })
    });
  }, [existingUserIds]);

  const setSrcObject = (ref: HTMLAudioElement, stream: MediaStream) => {
    if (ref) {
      ref.srcObject = stream;
    }
  }

  return (
    <>
      <div>室内だよ room id: {doc.id}, my id: {myId}</div>
      <div className="container">
        <ul>
          {remoteStreams.map((remoteStream) => {
            return <li><audio ref={ref => setSrcObject(ref, remoteStream.stream)} autoPlay /></li>;
          })}
        </ul>
      </div>
    </>
  )
};

export default IndoorSpace;
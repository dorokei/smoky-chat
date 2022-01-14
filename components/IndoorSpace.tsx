import { useEffect, useState } from 'react';
import Logger from '../lib/Logger'
import PeerConnectionManager from '../services/PeerConnectionManager'
import RoomModel from '../models/Room'
import VisualizedAudioStream from './VisualizedAudioStream'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faUser } from '@fortawesome/free-solid-svg-icons'
import UserIcon from './UserIcon';

// 1. Add myself to room
// 2. Check how many users already exist and send offer
// 3. Listen for offers, answers and ICE candidates
// 4. Exchage each streams
const IndoorSpace = ({ room, localStream }: { room: RoomModel, localStream: MediaStream }) => {
  const [myId, setMyId] = useState<string | undefined>(undefined);
  const [existingUserIds, setexistingUserIds] = useState<string[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<{ userId: string, stream: MediaStream }[]>([]);
  const replaceRemoteStreams = (remoteStreams: { userId: string, stream: MediaStream }[]) => {
    const copiesStreams = [...remoteStreams];
    setRemoteStreams(copiesStreams);
  };
  const roomRef = room.ref;
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
    new PeerConnectionManager(localStream, replaceRemoteStreams, storeIceCandidate)
  );
  if (myId) peerConnectionManager.setMyId(myId);

  // Add self to room
  useEffect(() => {
    // TODO: リロード時はlocalに保存してあるIDから復元したい(or delete deplicated user)
    roomRef.collection("users").add({}).then((userDoc) => {
      Logger.debug("Added me to room: ", userDoc.id);
      setMyId(userDoc.id);
    })

    return () => {
      // Stop all streams and close all connections
      peerConnectionManager.closeAll();
    };
  }, [room]);

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
        peerConnectionManager.setRemoteDescriptionBy(offer.from, offer);

        // send answer
        peerConnectionManager.createAnswerBy(offer.from).then((answer) => {
          peerConnectionManager.setLocalDescriptionBy(offer.from, answer); // 生成した Answer SDP を LocalDescription にセット
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
        peerConnectionManager.setRemoteDescriptionBy(answer.from, answer); // Answer SDP を RemoteDescription にセット
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
          peerConnectionManager.addIceCandidateBy(`${from}`, candidate);
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
    existingUserIds.forEach(targetUserId => {
      peerConnectionManager.createOfferBy(targetUserId).then((offer) => {
        const offerInfo = {
          offer: {
            type: offer.type,
            sdp: offer.sdp,
            from: myId
          }
        };
        Logger.debug("Post offer SDP: ", offerInfo);
        roomRef.collection("users").doc(`${targetUserId}`).collection("offers").add(offerInfo).then((doc) => {
          Logger.debug(doc);
        })

        peerConnectionManager.setLocalDescriptionBy(targetUserId, offer); // 生成した Offer SDP を LocalDescription にセット
      })
    });
  }, [existingUserIds]);

  const setSrcObject = (ref: HTMLAudioElement | null, stream: MediaStream) => {
    if (ref) {
      ref.srcObject = stream;
    }
  }

  return (
    <>
      <div>室内だよ room id: {room.roomId}, my id: {myId}</div>
      <div className="is-flex is-align-items-center">
        <UserIcon thumbUrl={null} figureClass='is-64x64'></UserIcon>
        <VisualizedAudioStream stream={localStream} />
      </div>
      <div className="container">
        <ul>
          {remoteStreams.map((remoteStream) => {
            return <li>
              <div className="is-flex is-align-items-center">
                <UserIcon thumbUrl={null} figureClass='is-64x64'></UserIcon>
                <VisualizedAudioStream stream={remoteStream.stream} />
              </div>
              <audio ref={ref => setSrcObject(ref, remoteStream.stream)} autoPlay />
            </li>;
          })}
        </ul>
      </div>
    </>
  )
};

export default IndoorSpace;

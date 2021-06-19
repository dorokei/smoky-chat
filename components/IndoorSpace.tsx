import { useEffect, useState } from 'react';
import firebase from '../lib/Firebase';
import Logger from '../lib/Logger'
import PeerConnectionManager from '../services/PeerConnectionManager'

// add user to room
// check how many users already exist and send offer
// listen for offer and answer
const IndoorSpace = ({ doc, mediaStream }: { doc: firebase.firestore.DocumentSnapshot, mediaStream: MediaStream }) => {
  const [myId, setMyId] = useState<string>(undefined);
  const [existingUserIds, setexistingUserIds] = useState<string[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<{ userId: string, stream: MediaStream }[]>([]);
  const replaceRemoteStreams = (remoteStreams: { userId: string, stream: MediaStream }[]) => {
    const copiesStreams = [...remoteStreams];
    setRemoteStreams(copiesStreams);
  };
  const [peerConnectionManager] = useState<PeerConnectionManager>(new PeerConnectionManager(mediaStream, replaceRemoteStreams));


  // Add self to room
  useEffect(() => {
    // TODO: リロード時はlocalに保存してあるIDから復元したい(or delete deplicated user)
    const roomRef = doc.ref;
    roomRef.collection("users").add({}).then((userDoc) => {
      Logger.debug("Added me to room: ", userDoc.id);
      setMyId(userDoc.id);
    })
  }, [doc]);

  // fetch already users (depend on my id)
  useEffect(() => {
    if (myId == undefined) return;
    const roomRef = doc.ref;
    roomRef.collection("users").get().then((usersDoc) => {
      const ids = usersDoc.docs.map(userDoc => userDoc.id).filter(id => id != myId);
      setexistingUserIds(ids);
      Logger.debug("fetched userIds: ", ids);
    })
  }, [myId]);

  // 1. listen to offers to me and answer to offer (depend on my id)
  // 2. listen to answers to me and set local
  useEffect(() => {
    if (myId == undefined) return;
    const roomRef = doc.ref;
    // listen to offers
    roomRef.collection("users").doc(`${myId}`).collection("offers").onSnapshot(async (offers) => {
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
    roomRef.collection("users").doc(`${myId}`).collection("answers").onSnapshot(async (answers) => {
      answers.docs.forEach(answerDoc => {
        const answer = answerDoc.data().answer;
        Logger.debug("A answer to me: ", answer);
        const peerConnection = peerConnectionManager.findOrCreateBy(`${answer.from}`);
        peerConnection.setRemoteDescription(answer); // Answer SDP を RemoteDescription にセット
      });
    });
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
        const roomRef = doc.ref;
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
            return <li><audio ref={ref => setSrcObject(ref, remoteStream.stream)} autoPlay controls /></li>;
          })}
        </ul>
      </div>
    </>
  )
};

export default IndoorSpace;
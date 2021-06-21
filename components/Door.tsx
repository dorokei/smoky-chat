import { useEffect, useState } from 'react';
import firebase from '../lib/Firebase';
import IndoorSpace from '../components/IndoorSpace'
import Logger from '../lib/Logger';

enum StandingAt {
  Indoor = 'Indoor',
  Outdoor = 'Outdoor'
};
// 3 states
// open: 人数と時間がOK
// close: { overCapacity: 人が減ったら入れる, exceeedTimeLimit: 入れない}
// entered: 入室済み
const Door = ({ doc }: { doc: firebase.firestore.DocumentSnapshot }) => {
  const current = new Date();
  const finishAt: Date = doc.data().finishAt.toDate();
  const [remainCount, serRemainCount] = useState(finishAt.getTime() - current.getTime());
  const [existingUserIds, setExistingUserIds] = useState<string[]>(undefined);
  const [mediaStream, setMediaStream] = useState<MediaStream>(undefined);
  const [standinAt, setStandinAt] = useState<StandingAt>(StandingAt.Outdoor);
  const capacity: number = doc.data().maxUsersCount;
  const roomRef = doc.ref;

  // fetch users and settimer
  useEffect(() => {
    // Listen users
    const unsubscribeUsers = roomRef.collection("users").onSnapshot(async (usersDoc) => {
      const users = usersDoc.docs.map(userDoc => userDoc.id);
      setExistingUserIds(users);
    });

    const timer = setTimeout(() => {
      Logger.debug("Time is over!");
      setStandinAt(StandingAt.Outdoor);
      serRemainCount(0);
    }, finishAt.getTime() - current.getTime());

    return function cleanup() {
      unsubscribeUsers();
      clearTimeout(timer);
    };
  }, [doc]);

  const enterTheRoom = () => {
    navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true,
    }).then((stream) => {
      Logger.debug("got user media");
      setMediaStream(stream);
      setStandinAt(StandingAt.Indoor);
    });
  };

  const hangOff = () => {
    setStandinAt(StandingAt.Outdoor);
    if (mediaStream) {
      // Stop media streams
      mediaStream.getTracks().forEach(function (track) {
        track.stop();
      });
    }
  }

  if (current.getTime() > finishAt.getTime()) {
    return (
      <div className="container">
        終了しました。
      </div>
    );
  }

  if (standinAt == StandingAt.Indoor && mediaStream) {
    return <>
      <IndoorSpace doc={doc} mediaStream={mediaStream} />
      <div className="container">
        <button onClick={hangOff}>退室する</button>
      </div>
    </>
  }

  if (existingUserIds == undefined) {
    return (
      <div className="container">
        Loading
      </div>
    );
  }

  if (existingUserIds && capacity <= existingUserIds.length) {
    return <div className="container">
      {`人数が超過しています。(現在${existingUserIds.length}人)`}
    </div>
  }

  return (
    <div className="container">
      <button onClick={enterTheRoom}>入室する</button>
    </div>
  );
}

export default Door;
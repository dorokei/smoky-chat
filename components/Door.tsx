import { useEffect, useState } from 'react';
import IndoorSpace from '../components/IndoorSpace'
import Logger from '../lib/Logger';
import RoomModel from '../models/Room'

enum StandingAt {
  Indoor = 'Indoor',
  Outdoor = 'Outdoor'
};

// 3 states
// open: 人数と時間がOK
// close: { overCapacity: 人が減ったら入れる, exceeedTimeLimit: 入れない}
// entered: 入室済み
const Door = ({ room }: { room: RoomModel }) => {
  const current = new Date();
  const finishAt: Date = room.finishAt;
  const capacity: number = room.maxUserCount;
  const [remainCount, serRemainCount] = useState(finishAt.getTime() - current.getTime());
  const [existingUserIds, setExistingUserIds] = useState<string[] | undefined>(undefined);
  const [localStream, setLocalStream] = useState<MediaStream | undefined>(undefined);
  const [standinAt, setStandinAt] = useState<StandingAt>(StandingAt.Outdoor);
  const roomRef = room.ref;

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
  }, [room]);

  const enterTheRoom = () => {
    navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true,
    }).then((stream) => {
      Logger.debug("got user media");
      setLocalStream(stream);
      setStandinAt(StandingAt.Indoor);
    });
  };

  const hangOff = () => {
    setStandinAt(StandingAt.Outdoor);
    if (localStream) {
      // Stop media streams
      localStream.getTracks().forEach(function (track) {
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

  if (standinAt == StandingAt.Indoor && localStream) {
    return <>
      <IndoorSpace room={room} localStream={localStream} />
      <button onClick={hangOff} className="button is-warning">退室する</button>
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
    <button onClick={enterTheRoom} className="button is-success">入室する</button>
  );
}

export default Door;

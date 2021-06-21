import { useEffect, useState } from 'react';
import firebase from '../lib/Firebase';
import IndoorSpace from '../components/IndoorSpace'

// 3 states
// open: 人数と時間がOK
// close: { overCapacity: 人が減ったら入れる, exceeedTimeLimit: 入れない}
// entered: 入室済み
const Door = ({ doc }: { doc: firebase.firestore.DocumentSnapshot }) => {
  const [existingUserIds, setExistingUserIds] = useState<string[]>(undefined);
  const [mediaStream, setMediaStream] = useState<MediaStream>(undefined);
  const finishAt: Date = doc.data().finishAt.toDate();
  const capacity: number = doc.data().maxUsersCount;
  const roomRef = doc.ref;

  const fetchedUsersCallback = (usersDoc: firebase.firestore.QuerySnapshot) => {
    const users = usersDoc.docs.map(userDoc => userDoc.id);
    setExistingUserIds(users);
  }

  // fetch already users (depend on my id)
  useEffect(() => {
    // Listen users
    const unsubscribeUsers = roomRef.collection("users").onSnapshot(async (usersDoc) => {
      fetchedUsersCallback(usersDoc);
    });

    return function cleanup() {
      unsubscribeUsers();
    };
  }, [doc]);

  const enterTheRoom = () => {
    navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true,
    }).then((stream) => {
      setMediaStream(stream);
    });
  };

  let errors: string[] = [];

  const current = new Date();
  if (current.getTime() > finishAt.getTime()) {
    errors.push("時間が終了しました。");
  } else if (existingUserIds && capacity <= existingUserIds.length) {
    errors.push(`人数が超過しています。(現在${existingUserIds.length}人)`);
  }

  if (errors.length > 0) {
    return (
      <div className="container">
        <ul>
          {errors.map((data) => {
            return <li>{data}</li>;
          })}
        </ul>
      </div>
    );
  }

  if (existingUserIds == undefined) {
    return (
      <div className="container">
        Loading
      </div>
    );
  }

  if (!mediaStream) {
    return (
      <div className="container">
        <button onClick={enterTheRoom}>入室する</button>
      </div>
    );
  }

  return <IndoorSpace doc={doc} mediaStream={mediaStream} />
}

export default Door;
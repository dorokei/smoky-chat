import { useEffect, useState } from 'react';
import firebase from '../lib/Firebase';
import IndoorSpace from '../components/IndoorSpace'

// state
// close: {overCapacity,exceeedTimeLimit}
// entered
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
  // useEffect(() => {
  //   if (doc == undefined) return;
  //   roomRef.collection("users").get().then((usersDoc) => {
  //     fetchedUsersCallback(usersDoc);
  //   })
  // }, [doc]);

  // Listen users
  roomRef.collection("users").onSnapshot(async (usersDoc) => {
    fetchedUsersCallback(usersDoc);
  });

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

  if (!mediaStream) {
    return (
      <div className="container">
        <button onClick={enterTheRoom}>入室する</button>
      </div>
    );
  }

  return <IndoorSpace doc={doc} />
}

export default Door;
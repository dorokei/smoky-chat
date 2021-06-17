import { useState, useEffect } from 'react'
import firebase from '../../lib/Firebase';
import { useRouter } from 'next/router'
import Logger from '../../lib/Logger'
import IndoorSpace from '../../components/IndoorSpace'

// Talk Room
// 4 states: {loading, loadSuccess, 404, room fetching error}
// TODO: 待機して人数の増減が見れる。好きなタイミングで入室できる。音声は聴けない。
export default function Room() {
  const router = useRouter()
  const { roomId } = router.query
  const [roomDoc, setRoomDoc] = useState<firebase.firestore.DocumentSnapshot>(undefined);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(undefined);

  // fetch room info
  useEffect(() => {
    if (roomId == undefined) return;
    const db = firebase.firestore();
    const roomRef = db.collection("rooms").doc(`${roomId}`);
    Logger.debug("fetch room doc. room id: ", roomId);
    roomRef.get().then((doc) => {
      if (doc.exists) {
        Logger.debug("Document data:", doc.data());
        setRoomDoc(doc);
      } else {
        // doc.data() will be undefined in this case
        Logger.debug("No such document!");
        setRoomDoc(null);
      }
    }).catch((error) => {
      Logger.error("Error getting document:", error);
      setErrorMessage("Something wrong occured")
      setRoomDoc(null);
    }).finally(() => {
      setLoading(false);
    });
  }, [roomId]);

  // loading
  if (loading) {
    return (
      <div>
        loading...
        <p>Post: {roomId}</p>
      </div>
    );
  }

  // loadSuccess
  if (roomDoc) {
    return <IndoorSpace doc={roomDoc} />
  }

  // error
  if (errorMessage) {
    return <div>{errorMessage}</div>
  }

  // 404
  return <div>404 Not Found</div>
}
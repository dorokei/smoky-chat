import { useState, useEffect } from 'react'
import firebase from '../../lib/Firebase';
import { useRouter } from 'next/router'
import Logger from '../../lib/Logger'

// Talk Room
// 4 states: {loading, loadSuccess, 404, room fetching error}
export default function Room() {
  const router = useRouter()
  const { room_id } = router.query

  const roomDoc: firebase.firestore.DocumentSnapshot = undefined;
  const [snapShot, setSnapShot] = useState(roomDoc);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(undefined);

  // fetch room info
  useEffect(() => {
    const db = firebase.firestore();
    const roomRef = db.collection("rooms").doc(`${room_id}`);
    roomRef.get().then((doc) => {
      if (doc.exists) {
        Logger.debug("Document data:", doc.data());
        setSnapShot(doc);
      } else {
        // doc.data() will be undefined in this case
        Logger.debug("No such document!");
        setSnapShot(null);
      }
    }).catch((error) => {
      Logger.error("Error getting document:", error);
      setErrorMessage("Something wrong occured")
      setSnapShot(null);
    }).finally(() => {
      setLoading(false);
    });
  }, [room_id]);

  // loading
  if (loading) {
    return (
      <div>
        loading...
        <p>Post: {room_id}</p>
      </div>
    );
  }

  // loadSuccess
  if (snapShot) {
    return <div>OK</div>
  }

  // error
  if (errorMessage) {
    return <div>{errorMessage}</div>
  }

  // 404
  return <div>404 Not Found</div>
}
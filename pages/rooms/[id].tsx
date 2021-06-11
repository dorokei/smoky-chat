import { useState } from 'react'
import firebase from '../../lib/Firebase';
import { useRouter } from 'next/router'

// Talk Room
// 4 states: {loading, loadSuccess, 404, room fetching error}
export default function Room() {

  const router = useRouter()
  const { id } = router.query

  const roomDoc: firebase.firestore.DocumentSnapshot = undefined;
  const [snapShot, setSnapShot] = useState(roomDoc);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(undefined);

  const db = firebase.firestore();
  const roomRef = db.collection("rooms").doc(`${id}`);
  roomRef.get().then((doc) => {
    if (doc.exists) {
      console.log("Document data:", doc.data());
      setSnapShot(doc);
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
      setSnapShot(null);
    }
  }).catch((error) => {
    console.log("Error getting document:", error);
    setErrorMessage("Something wrong occured")
    setSnapShot(null);
  }).finally(() => {
    setLoading(false);
  });

  // loading
  if (loading) {
    return (
      <div>
        loading...
        <p>Post: {id}</p>
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
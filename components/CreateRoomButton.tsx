import { FC, useEffect, useContext, useState } from 'react';
import Router from 'next/router';
import firebase from '../lib/Firebase';
import Logger from '../lib/Logger'
import { AuthContext } from '../contexts/Auth';

const CreateRoomButton: FC = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(undefined);

  useEffect(() => {
    currentUser && Router.push('/')
  }, [currentUser]);

  const createRoom = () => {
    setErrorMessage(undefined);

    const db = firebase.firestore();
    const roomsRef = db.collection("rooms");
    const roomInfo = {
      finishAt: new Date(Date.now() + 10 * 60 * 1000)
    };
    db.collection("rooms").add(roomInfo).then((doc) => {
      if (doc) {
        Logger.debug("Doc id:", doc.id);
        Router.push('/rooms/' + doc.id);
      } else {
        Logger.debug("No such document!");
      }
    }).catch((error) => {
      Logger.error("Error getting document:", error);
      setErrorMessage("Something wrong occured");
    }).finally(() => {
      setLoading(false);
    });
  }

  if (loading) {
    return <div>送信中</div>
  }

  return (
    <div className="container">
      <button onClick={createRoom}>休憩する</button>
      {errorMessage}
    </div>
  )
}

export default CreateRoomButton;
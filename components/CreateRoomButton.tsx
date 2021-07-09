import { FC, useEffect, useContext, useState } from 'react';
import Router from 'next/router';
import firebase from '../lib/Firebase';
import Logger from '../lib/Logger'
import { AuthContext } from '../contexts/Auth';

const CreateRoomButton: FC = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    currentUser && Router.push('/')
  }, [currentUser]);

  const createRoom = () => {
    setErrorMessage(undefined);

    const db = firebase.firestore();
    const roomsRef = db.collection("rooms");
    const minutes = 10; // 10分
    const roomInfo = {
      finishAt: new Date(Date.now() + minutes * 60 * 1000),
      maxUsersCount: 5
    };
    db.collection("rooms").add(roomInfo).then((doc) => {
      if (doc) {
        Logger.debug("Doc id:", doc.id);
        Router.push('/rooms/' + doc.id);
      } else {
        Logger.error("Couldn't add a room.");
      }
    }).catch((error) => {
      Logger.error("Error adding a room:", error);
      setErrorMessage("Something wrong occured");
    }).finally(() => {
      setLoading(false);
    });
  }

  if (loading) {
    return <div>送信中</div>
  }

  return (
    <>
      <button
        className="border border-indigo-500 bg-indigo-500 text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-indigo-600 focus:outline-none focus:shadow-outline"
        onClick={createRoom}
      >
        休憩する
      </button>
      {errorMessage}
    </>
  )
}

export default CreateRoomButton;
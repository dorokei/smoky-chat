import { useEffect, useState } from 'react';
import RoomModel from '../models/Room'

const CountUsers = ({ room }: { room: RoomModel }) => {
  // fetch already users (depend on my id)
  const [count, setCount] = useState(0);
  useEffect(() => {
    // Listen users
    const roomRef = room.ref;
    const unsubscribeUsers = roomRef.collection("users").onSnapshot(async (usersDoc) => {
      setCount(usersDoc.size);
    });

    return function cleanup() {
      unsubscribeUsers();
    };
  }, [room]);

  return <>{count}</>
}

export default CountUsers;
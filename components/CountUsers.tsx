import { useEffect, useState } from 'react';
import firebase from '../lib/Firebase';
const CountUsers = ({ doc }: { doc: firebase.firestore.DocumentSnapshot }) => {
  // fetch already users (depend on my id)
  const [count, setCount] = useState(0);
  useEffect(() => {
    // Listen users
    const roomRef = doc.ref;
    const unsubscribeUsers = roomRef.collection("users").onSnapshot(async (usersDoc) => {
      setCount(usersDoc.size);
    });

    return function cleanup() {
      unsubscribeUsers();
    };
  }, [doc]);

  return <>{count}</>
}

export default CountUsers;
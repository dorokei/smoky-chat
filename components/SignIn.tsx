import { FC, useEffect, useContext } from 'react';
import Router from 'next/router';
import firebase from '../lib/Firebase';
import { AuthContext } from '../contexts/Auth';

const SignIn: FC = () => {
  const { currentUser } = useContext(AuthContext);

  // useEffect(() => {
  //   currentUser && Router.push('/')
  // }, [currentUser]);

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    // firebase.auth().signInWithRedirect(provider);
    firebase.auth().signInWithPopup(provider).then((result) => {
      // const credential = result.credential;
      // const token = credential?.providerId;
      // const user = result.user;
    }).catch((error) => {
      // // Handle Errors here.
      // const errorCode = error.code;
      // const errorMessage = error.message;
      // // The email of the user's account used.
      // const email = error.email;
      // // The firebase.auth.AuthCredential type that was used.
      // const credential = error.credential;
    });
  }

  const signOut = () => {
    firebase.auth().signOut().then(() => {
      // logout
    }).catch((error) => {
      // error
    });
  }


  if (!currentUser) {
    return (
      <div className="container">
        <button onClick={signInWithGoogle}>googleでログインする</button>
      </div>
    )
  } else {
    return (
      <div className="container">
        <button onClick={signOut}>ログアウト</button>
      </div >
    )
  }
}

export default SignIn;
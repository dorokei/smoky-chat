import { FC, useContext } from 'react';
import firebase from '../lib/Firebase';
import { AuthContext } from '../contexts/Auth';

const SignInButton: FC = () => {
  const { currentUser } = useContext(AuthContext);

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
      <button className="button is-primary" onClick={signInWithGoogle}>Sign in with Google</button>
    )
  } else {
    return (
      <a onClick={signOut}>ログアウト</a>
    )
  }
}

export default SignInButton;
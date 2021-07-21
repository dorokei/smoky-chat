import { FC } from 'react';
import firebase from '../lib/Firebase';

const SignOutButton: FC = () => {
  const signOut = () => {
    firebase.auth().signOut().then(() => {
      // logout
    }).catch((error) => {
      // error
    });
  }

  return <a onClick={signOut}>ログアウト</a>
}

export default SignOutButton;
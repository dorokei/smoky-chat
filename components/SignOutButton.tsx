import { FC } from 'react';
import firebase from '../lib/Firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const SignOutButton: FC = () => {
  const signOut = () => {
    firebase.auth().signOut().then(() => {
      // logout
    }).catch((error) => {
      // error
    });
  }

  return <a onClick={signOut}>
    <span className="icon"><FontAwesomeIcon icon={faSignOutAlt} /></span>
    ログアウト
  </a>
}

export default SignOutButton;
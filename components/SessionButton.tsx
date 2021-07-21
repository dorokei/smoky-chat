import { useContext } from 'react';
import { AuthContext } from '../contexts/Auth';
import SignInButton from './SignInButton';
import UserMenuButton from './UserMenuButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

const SessionButton = () => {
  const { currentUser } = useContext(AuthContext);

  console.log("SessionButton", currentUser);

  if (currentUser === undefined) {
    // Fetching user data from datastore
    return <span className="icon"><FontAwesomeIcon icon={faSpinner} pulse /></span>;
  }

  if (currentUser === null) {
    // Guest User
    return <a><SignInButton /></a>;
  } else {
    // Member
    return <UserMenuButton user={currentUser} />;
  }
}

export default SessionButton
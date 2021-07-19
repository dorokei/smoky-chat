import { useContext } from 'react';
import { AuthContext } from '../contexts/Auth';
import SignInButton from './SignInButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

const SessionButton = () => {
  const { currentUser } = useContext(AuthContext);

  if (currentUser == undefined) {
    // Fetching user data from datastore
    return <span className="icon"><FontAwesomeIcon icon={faSpinner} pulse /></span>;
  }

  if (currentUser == null) {
    // Guest User
    return <a><SignInButton /></a>;
  } else {
    // Member
    return <span className="icon"><FontAwesomeIcon icon={faUser} /></span>;
  }
}

export default SessionButton
import { useState, useRef, useEffect } from 'react'
import classNames from 'classnames'
import UserIcon from './UserIcon';
import User from '../models/User';
import SignOutButton from './SignOutButton';

const UserMenuButton = ({ user }: { user: User }) => {
  const [dropDownIsActive, setdropDownIsActive] = useState(false);
  const dropDownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dropDownIsActive && dropDownRef.current != null) {
      dropDownRef.current.focus();
    }
  }, [dropDownIsActive]);

  return <div
    className={classNames("dropdown is-right", {
      'is-active': dropDownIsActive
    })}
    onBlur={() => setdropDownIsActive(false)}
    ref={dropDownRef}
    tabIndex={1}
  >
    <div className="dropdown-trigger">
      <a onClick={() => setdropDownIsActive(!dropDownIsActive)} >
        <UserIcon thumbUrl={user.thumbUrl} figureClass='is-24x24' />
      </a>
    </div>
    <div className="dropdown-menu" id="dropdown-menu6" role="menu">
      <div className="dropdown-content">
        <div className="dropdown-item">
          <SignOutButton />
        </div>
      </div>
    </div>
  </div>
}

export default UserMenuButton


import { useState } from 'react'
import classNames from 'classnames'
import SessionButton from './SessionButton';

const Header = () => {
  const [navbarBurgerIsActive, setNavbarBurgerIsActive] = useState(false);

  return <nav className="navbar" role="navigation" aria-label="main navigation">
    <div className="container">
      <div className="navbar-brand">
        <a className="navbar-item has-text-weight-bold is-size-4">
          Smoky Chat
        </a>

        <a role="button"
          className={classNames("navbar-burger", {
            'is-active': navbarBurgerIsActive
          })}
          aria-label="menu"
          aria-expanded="false"
          data-target="navbarBasicExample"
          onClick={() => setNavbarBurgerIsActive(!navbarBurgerIsActive)}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div
        id="navbarBasicExample"
        className={classNames("navbar-menu", {
          'is-active': navbarBurgerIsActive
        })}
      >
        <div className="navbar-end">
          <div className="navbar-item">
            <div className="buttons">
              <SessionButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
}

export default Header
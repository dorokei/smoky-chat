import { useContext } from 'react';
import Image from "next/image";
import SignIn from "../components/SignIn"
import CreateRoomButton from "../components/CreateRoomButton"
import { AuthContext } from '../contexts/Auth';

export default function Home() {
  const { currentUser } = useContext(AuthContext);
  const name = currentUser ? currentUser.displayName : "Guest";

  // const profileImage: HTMLElement = currentUser ? <img src={currentUser.photoURL} /> : <></>;

  return <div>
    <main>
      {/* <SignIn />
        {name}
        {profileImage} */}

      <section className="hero is-primary">
        <div className="hero-body">
          <p className="title">
            喫煙所
            <span className="is-pulled-right"><CreateRoomButton /></span>
          </p>
          <p className="subtitle">
            10分/最大4人
          </p>
        </div>
      </section>
      <section className="hero is-link">
        <div className="hero-body">
          <p className="title">
            カフェ
            <span className="is-pulled-right"><CreateRoomButton /></span>
          </p>
          <p className="subtitle">
            25分/最大5人
          </p>
        </div>
      </section>
    </main>
  </div>
};

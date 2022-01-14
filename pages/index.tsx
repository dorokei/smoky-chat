import { useContext } from 'react';
import CreateRoomButton from "../components/CreateRoomButton"
import { AuthContext } from '../contexts/Auth';
import MainLayout from "../components/MainLayout";

export default function Home() {
  const { currentUser } = useContext(AuthContext);
  const name = currentUser ? currentUser.name : "Guest";

  return <div>
    <main>
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

Home.getLayout = (page: any) => (
  <MainLayout>{page}</MainLayout>
)

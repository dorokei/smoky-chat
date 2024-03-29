import { useContext } from 'react';
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import SignIn from "../components/SignIn"
import CreateRoomButton from "../components/CreateRoomButton"
import { AuthContext } from '../contexts/Auth';

export default function Home() {
  const { currentUser } = useContext(AuthContext);
  const name = currentUser ? currentUser.displayName : "Guest";

  // const profileImage: HTMLElement = currentUser ? <img src={currentUser.photoURL} /> : <></>;

  return (
    <div className={styles.container}>
      <Head>
        <title>Smoky Chat</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>
        {/* <SignIn />
        {name}
        {profileImage} */}

        <CreateRoomButton />


      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
};

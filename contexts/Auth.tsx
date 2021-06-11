//import {User} from "firebase/app";
import { FC, createContext, useEffect, useState } from 'react';
import firebase from '../lib/Firebase';

type AuthContextProps = {
  currentUser: firebase.User | null | undefined
}

const AuthContext = createContext<AuthContextProps>({ currentUser: undefined });

const AuthProvider: FC = ({ children }) => {
  // undefined: 未確定(firebase問い合わせ中含む)
  // null: 未ログイン
  const [currentUser, setCurrentUser] = useState<firebase.User | null | undefined>(
    undefined
  );

  console.log(currentUser);

  useEffect(() => {
    // ログイン状態が変化するとfirebaseのauthメソッドを呼び出す
    firebase.auth().onAuthStateChanged((user) => {
      console.log(user);
      setCurrentUser(user);
    })
  }, []);

  /* 下階層のコンポーネントをラップする */
  return (
    <AuthContext.Provider value={{ currentUser: currentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }
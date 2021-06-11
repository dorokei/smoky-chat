import { FC, createContext, useEffect, useState } from 'react';
import firebase from '../lib/Firebase';
import Logger from '../lib/Logger'

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

  Logger.debug("currentUser", currentUser);

  useEffect(() => {
    // ログイン状態が変化するとfirebaseのauthメソッドを呼び出す
    firebase.auth().onAuthStateChanged((user) => {
      Logger.debug("currentUser", currentUser);
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
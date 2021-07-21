import { FC, createContext, useEffect, useState } from 'react';
import firebase from '../lib/Firebase';
import Logger from '../lib/Logger'
import User from '../models/User'

type AuthContextProps = {
  currentUser: User | null | undefined
}

const AuthContext = createContext<AuthContextProps>({ currentUser: undefined });

const AuthProvider: FC = ({ children }) => {
  // undefined: 未確定(firebase問い合わせ中含む)
  // null: 未ログイン
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(
    undefined
  );

  Logger.debug("AuthProvider. currentUser", currentUser);

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
      Logger.debug("onAuthStateChanged. currentUser: ", user);
      // TODO: uidからUserをFirestoreから取得すべし。
      if (user != null) {
        const tmpUser = new User(user.displayName, user.uid, user.photoURL);
        setCurrentUser(tmpUser);
      } else {
        setCurrentUser(null); // 未定義(Guest)
      }
    })
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser: currentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }
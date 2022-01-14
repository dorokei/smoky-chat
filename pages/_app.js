import "../styles/globals.css";
import { AuthProvider } from "../contexts/Auth";
import MainLayout from "../components/MainLayout";

function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page);
  return <AuthProvider>{getLayout(<Component {...pageProps} />)}</AuthProvider>;
}

export default App;

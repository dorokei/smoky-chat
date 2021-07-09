import "../styles/globals.css";
import { AuthProvider } from "../contexts/Auth";
import MainLayout from "../components/MainLayout";

function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </AuthProvider>
  );
}

export default App;

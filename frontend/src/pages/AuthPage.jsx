import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthForm from '../components/AuthForm'; // ✅ Not {AuthForm}

export default function AuthPage() {
  return (
    <>
      <Header />
      <main>
        <AuthForm />
      </main>
      <Footer />
    </>
  );
}

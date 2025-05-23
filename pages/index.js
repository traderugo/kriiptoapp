import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import StickyShareBar from '../components/StickyShareBar';
import MasterclassBanner from '../components/MasterclassBanner';

import Calculator from "../components/Calculator";

import Link from "next/link";

export default function Home() {
  const [user, setUser] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) checkSubscription(user.email);
    });
  }, []);

  const login = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert("Check your email for login link");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsActive(false);
  };

  const checkSubscription = async (email) => {
    setLoading(true);
    const { data } = await supabase
      .from("subscribers")
      .select("expires_at")
      .eq("email", email)
      .single();

    const now = new Date();
    const expiry = data ? new Date(data.expires_at) : null;
    setIsActive(expiry && expiry > now);
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
          <nav className="bg-blue-600 text-white w-full p-4 flex justify-between sticky top-0 z-50 shadow">
      <div className="font-bold">Krypto Kave</div>
      <div className="space-x-4 bg-white text-blue-600 p-2 rounded">
      </div>
    </nav>

      <div className="bg-white p-6 w-full max-w-md">
        <Calculator />
       
        <br />
        <StickyShareBar url={"https://kryptokave.vercel.app"} message={"Check out this trading calculator that helps manage risk like a pro! 📊"} />
        <hr />
        <MasterclassBanner />
        <br />
        <h1 className="text-2xl font-bold mb-4 text-center">Sign in to join</h1>

        {!user ? (
          <>
            <input
              type="email"
              className="w-full p-2 mb-4 border rounded"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={login}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Get Login Link
            </button>
          </>
        ) : (
          <>
            <p className="mb-2">Logged in as: {user.email}</p>
           <a
  href="https://chat.whatsapp.com/your-group-link"
  target="_blank"
  rel="noopener noreferrer"
  className="block p-6 rounded-2xl shadow-md border border-gray-200 bg-white hover:shadow-lg hover:border-green-600 transition"
  style={{ color: '#25D366' }}
>
  <h2 className="text-xl font-semibold mb-2" style={{ color: '#25D366' }}>
    Join Masterclass Group
  </h2>
</a>
<br />
                      <Link
            href="/home"
            className="block p-6 rounded-2xl shadow-md border border-gray-200 bg-white hover:shadow-lg hover:border-blue-500 transition"
          >
            <h2 className="text-xl font-semibold mb-2 text-blue-600">Go to Signals Portal</h2>
          </Link><br />
            <button
              onClick={logout}
              className="mb-4 bg-red-600 text-white p-2 rounded hover:bg-red-700"
            >
              Log Out
            </button>

  
          </>
        )}
      </div>
      <footer className="mt-12 text-center text-sm text-gray-500 flex justify-center items-center space-x-2">
  <span>Made with&nbsp;❤️&nbsp; by</span>
  <a
    href="https://twitter.com/trader_ugo"
    target="_blank"
    rel="noopener noreferrer"
    className="font-semibold text-blue-600 hover:underline"
  >
    Trader Ugo
  </a>
  <br />
  <br />
  <br />  <br />
  <br />
  <br />
  <br />
  <br />

</footer>

    </main>
  );
}
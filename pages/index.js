import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import StickyShareBar from '../components/StickyShareBar';
import MasterclassBanner   from '../components/MasterclassBanner';  
import MasterclassCTA   from '../components/Cta';  
import LandingPage from '../components/LandingPage';


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
    <main className="min-h-screen flex flex-col items-center bg-black">
  <nav className="bg-blue-600 text-white w-full px-4 py-3 flex justify-between items-center sticky top-0 z-50 shadow">
    <div className="text-lg font-bold">Krypto Kave</div>
  </nav>

  <div className="w-full   flex flex-col gap-6">
    <LandingPage />

   

    <div className="bg-white p-6 w-full md:w-1/2  rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Signals</h1>

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
          <p className="mb-2 text-center">Logged in as: {user.email}</p>
                      
          <Link
            href="/home"
            className="block p-6 rounded-2xl shadow-md border border-gray-200 bg-white hover:shadow-lg hover:border-blue-500 transition text-center"
          >
            <h2 className="text-xl font-semibold mb-2 text-blue-600">Go to Signals page</h2>
          </Link>
          <br />
          <button
            onClick={logout}
            className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700"
          >
            Log Out
          </button>
        </>
      )}
    </div>
  </div>

  <footer className="mt-12 mb-6 text-center text-sm text-gray-500">
     &copy; {new Date().getFullYear()} KryptoKave. All rights reserved.

  </footer>
</main>

  );
}
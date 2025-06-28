import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import StickyShareBar from '../components/StickyShareBar';
import MasterclassBanner from '../components/MasterclassBanner';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import PWAiOSBanner from '../components/PWAiOSBanner';

import Calculator from "../components/Calculator";

import Link from "next/link";
import Image from "next/image";

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
     <nav className="bg-white w-full p-4 flex justify-between sticky top-0 z-50 shadow">
      <div className="font-bold"><Link href="/">
  <Image src="/logo.png" alt="Logo" width={150} height={150} />
</Link></div>
      <div className="space-x-4 bg-indigo-500 text-white p-2 rounded">
        <Link href="/mentorship">Mentorship</Link>
      </div>
    </nav>
      <div className="bg-white p-6 w-full max-w-md">
        <Calculator />
       <StickyShareBar url={"https://kryptokave.vercel.app"} message={"Check out this trading calculator that helps manage risk like a pro! 📊"} />
      <br />
       <hr />
        <MasterclassBanner />
        <br />
        <PWAInstallPrompt />
      <PWAiOSBanner />
       
<div className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-10 px-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-6 mt-10">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold">Want the latest signals?</h2>
        <p className="text-sm md:text-base mt-1 text-blue-100">
          Sign in to get exclusive access to sniper-level entries, exits, and RR.
        </p>
      </div>
      <Link href="/login">
        <a className="px-6 py-3 bg-white text-blue-700 font-bold rounded-xl shadow-lg hover:bg-blue-100 transition-all duration-300">
          Sign In Now
        </a>
      </Link>
    </div>  
      </div>
       <br />
        
      <footer className="mt-12 text-center text-sm text-gray-500 flex justify-center items-center space-x-2">
        <span>Made with&nbsp;❤️&nbsp; by</span>
      <a
        href="https://twitter.com/trader_ugo"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-blue-600 hover:underline"
      >
        Trader Ugo
      </a> <br />
</footer>

    </main>
  );
}
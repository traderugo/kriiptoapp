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
        <Link href="/home"></Link>
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
       
         <h2 className="text-2xl font-bold  mb-2">
  <section className="bg-white text-gray-900 py-24 px-3 text-center">
  <div className="max-w-4xl mx-auto">
    <h3 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
      Unlock <span className="text-green-600">VIP Signals</span> and <span className="text-blue-600">Mentorship</span> —<br />
      <span className="text-gray-700">Your Edge in the Market Starts Here</span>
    </h3>
    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
      Access precision entries, risk-managed setups, and expert guidance. Dominate the charts — not your emotions.
    </p>
 
  </div>
</section>

</h2>
<div className="flex items-center justify-center ">        
  <Link href="/login">
      <a className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition">
        Sign in to join
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
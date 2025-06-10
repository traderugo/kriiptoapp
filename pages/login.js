import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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

      <div className="bg-white p-6 w-full max-w-md">
      
       
         <h2 className="text-2xl font-bold  mb-2">

</h2>
        <h3 className="text-2xl font-bold mb-4 text-center">Sign in to join</h3>

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

<br />
                      <Link
            href="/home"
            className="block p-6 rounded-2xl shadow-md border border-gray-200 bg-white hover:shadow-lg hover:border-blue-500 transition"
          >
            <h2 className="text-xl font-semibold mb-2 text-blue-600">Login</h2>
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
       <br />
        
 

    </main>
  );
}
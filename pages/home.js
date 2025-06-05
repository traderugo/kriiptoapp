// pages/admin.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import TelegramDMAccessBanner from "../components/Cta";
import Link from 'next/link';

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const sessionUser = sessionData?.session?.user;

      if (sessionError || !sessionUser) {
        router.push('/');
        return;
      }

      setUser(sessionUser);

      const { data: adminList, error: adminError } = await supabase.from('admins').select('email');

      if (adminError) {
        console.error('Error fetching admin list:', adminError.message);
        setLoading(false);
        return;
      }

      const isUserAdmin = adminList.some((admin) => admin.email === sessionUser.email);
      setIsAdmin(isUserAdmin);

      setLoading(false);
    };

    checkAdmin();
  }, [router]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!isAdmin) return <p className="p-4 text-red-600">Access Denied</p>;

  const adminLinks = [
    { href: "/signals", title: "Signals", description: "List of signals" },
    { href: "/", title: "Mentorship", description: "Courses on Trading Futures" },
    { href: "/", title: "Subscribers", description: "List of subscribers" },
    { href: "/", title: "Calculator", description: "Go to Trade Calculator" },
    { href: "/add-signals", title: "Publish Signals", description: "Admin" },
    { href: "/edit-subscribers", title: "Subscribers", description: "Admin" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <TelegramDMAccessBanner />
              <hr />
              <br />
              <br />
      <div className="grid gap-6 md:grid-cols-2">
              

        {adminLinks.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className="block p-6 rounded-2xl shadow-md border border-gray-200 bg-white hover:shadow-lg hover:border-blue-500 transition"
          >
            <h2 className="text-xl font-semibold mb-2 text-blue-600">{link.title}</h2>
            <p className="text-gray-600">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';

export default function EditSubscribers() {
  const [user, setUser] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [adminEmails, setAdminEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdowns, setCountdowns] = useState({});
  const [search, setSearch] = useState('');
  const [searchAffiliate, setSearchAffiliate] = useState('');

  useEffect(() => {
    const fetchUserAndSubscribers = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoading(false);
        return;
      }

      const userEmail = session.user.email;
      setUser(session.user);

      const { data: admins, error } = await supabase.from('admins').select('email');
      if (error) {
        console.error('Error fetching admins:', error.message);
        setLoading(false);
        return;
      }

      const emails = admins.map((admin) => admin.email);
      setAdminEmails(emails);

      if (!emails.includes(userEmail)) {
        setLoading(false);
        return;
      }

      const { data, error: subError } = await supabase
        .from('subscribers')
        .select('id, email, expiry, remarks, affiliate');

      if (!subError) setSubscribers(data);
      setLoading(false);
    };

    fetchUserAndSubscribers();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedCountdowns = {};

      subscribers.forEach((sub) => {
        const expiry = new Date(sub.expiry).getTime();
        const now = Date.now();
        const diff = expiry - now;

        if (diff <= 0) {
          updatedCountdowns[sub.id] = 'Expired';
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          updatedCountdowns[sub.id] = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
      });

      setCountdowns(updatedCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [subscribers]);

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((sub) => {
      const emailMatch = sub.email.toLowerCase().includes(search.toLowerCase());
      const affiliateMatch = sub.affiliate?.toLowerCase().includes(searchAffiliate.toLowerCase());
      return emailMatch && affiliateMatch;
    });
  }, [search, searchAffiliate, subscribers]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!user || !adminEmails.includes(user.email)) {
    return <p className="p-6 text-red-600">Access Denied</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6 flex justify-between items-center">
        <span>🛠 Subscribers</span>
        <span className="text-gray-600 text-sm">
          Total: <strong>{subscribers.length}</strong> | Shown: <strong>{filteredSubscribers.length}</strong>
        </span>
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <input
          type="search"
          placeholder="Search subscribers by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="search"
          placeholder="Search by affiliate..."
          value={searchAffiliate}
          onChange={(e) => setSearchAffiliate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {filteredSubscribers.length === 0 ? (
        <p className="text-center text-gray-500">No subscribers found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredSubscribers.map((sub) => {
            const isExpired = countdowns[sub.id] === 'Expired';

            return (
              <div
                key={sub.id}
                className={`border rounded-lg p-4 shadow hover:shadow-md transition-shadow bg-white ${
                  isExpired ? 'opacity-80' : ''
                }`}
              >
                <div className="mb-2">
                  <p className="font-semibold text-sm sm:text-base truncate">{sub.email}</p>
                </div>

                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-700">Affiliate</label>
                  <p className="text-sm text-gray-800 truncate">{sub.affiliate || '—'}</p>
                </div>

                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-700">Expiry</label>
                  <p className="text-sm text-gray-800">
                    {new Date(sub.expiry).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs mb-2">
                  <p className="text-red-600 font-mono">
                    Time Left: {countdowns[sub.id] || '...'}
                  </p>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded text-white text-[10px] ${
                      isExpired ? 'bg-gray-500' : 'bg-green-600'
                    }`}
                  >
                    {isExpired ? 'Expired' : 'Active'}
                  </span>
                </div>

                <label className="block mb-1 text-xs font-medium text-gray-700">Remarks</label>
                <p className="text-xs sm:text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
                  {sub.remarks || '—'}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

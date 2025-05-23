import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';

export default function EditSubscribers() {
  const [user, setUser] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [adminEmails, setAdminEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdowns, setCountdowns] = useState({});
  const [search, setSearch] = useState('');

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

      const { data: admins, error } = await supabase
        .from('admins')
        .select('email');

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
        .select('id, email, expiry, remarks');

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
          const hours = Math.floor(
            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          updatedCountdowns[sub.id] = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
      });

      setCountdowns(updatedCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [subscribers]);

  const handleUpdate = async (id, updatedExpiry) => {
    const { error } = await supabase
      .from('subscribers')
      .update({ expiry: updatedExpiry })
      .eq('id', id);

    if (!error) {
      setSubscribers((prev) =>
        prev.map((sub) =>
          sub.id === id ? { ...sub, expiry: updatedExpiry } : sub
        )
      );
    } else {
      alert('Error updating subscriber.');
    }
  };

  const handleRemarksChange = async (id, newRemarks) => {
    const { error } = await supabase
      .from('subscribers')
      .update({ remarks: newRemarks })
      .eq('id', id);

    if (!error) {
      setSubscribers((prev) =>
        prev.map((sub) => (sub.id === id ? { ...sub, remarks: newRemarks } : sub))
      );
    } else {
      alert('Error updating remarks.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return;

    const { error } = await supabase.from('subscribers').delete().eq('id', id);

    if (!error) {
      setSubscribers((prev) => prev.filter((sub) => sub.id !== id));
    } else {
      alert('Error deleting subscriber.');
    }
  };

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((sub) =>
      sub.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, subscribers]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!user || !adminEmails.includes(user.email)) {
    return <p className="p-6 text-red-600">Access Denied</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6 flex justify-between items-center">
        <span>🛠 Edit Subscribers</span>
        <span className="text-gray-600 text-sm">
          Total: <strong>{subscribers.length}</strong>
        </span>
      </h1>

      <input
        type="search"
        placeholder="Search subscribers by email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {filteredSubscribers.length === 0 ? (
        <p className="text-center text-gray-500">No subscribers found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredSubscribers.map((sub) => (
            <div
              key={sub.id}
              className="border rounded-lg p-4 shadow hover:shadow-md transition-shadow bg-white"
            >
              <div className="mb-2">
                <p className="font-semibold text-sm sm:text-base truncate">{sub.email}</p>
              </div>

              <label className="block mb-2 text-xs font-medium text-gray-700">
                Expiry
                <input
                  type="datetime-local"
                  defaultValue={new Date(sub.expiry).toISOString().slice(0, 16)}
                  onChange={(e) => handleUpdate(sub.id, e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1 text-xs sm:text-sm"
                />
              </label>

              <p className="text-red-600 font-mono text-xs mb-2">
                Time Left: {countdowns[sub.id] || '...'}
              </p>

              <label className="block mb-3 text-xs font-medium text-gray-700">
                Remarks
                <input
                  type="text"
                  defaultValue={sub.remarks || ''}
                  onBlur={(e) => handleRemarksChange(sub.id, e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1 text-xs sm:text-sm"
                />
              </label>

              <div className="flex items-center justify-between">
                <span className="text-green-600 text-xs">Auto-saves</span>
                <button
                  onClick={() => handleDelete(sub.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

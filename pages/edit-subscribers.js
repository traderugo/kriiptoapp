import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function EditSubscribers() {
  const [user, setUser] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState([]);
  const [adminEmails, setAdminEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdowns, setCountdowns] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return setLoading(false);

      const userEmail = session.user.email;
      setUser(session.user);

      const { data: admins, error } = await supabase
        .from('admins')
        .select('email');

      if (error) return setLoading(false);

      const emails = admins.map((admin) => admin.email);
      setAdminEmails(emails);

      if (!emails.includes(userEmail)) return setLoading(false);

      const { data, error: subError } = await supabase
        .from('subscribers')
        .select('id, email, expiry, remarks');

      if (!subError) {
        setSubscribers(data);
        setFilteredSubscribers(data);
      }

      setLoading(false);
    };

    fetchData();
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

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredSubscribers(subscribers);
    } else {
      setFilteredSubscribers(
        subscribers.filter((sub) =>
          sub.email.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, subscribers]);

  const handleUpdate = async (id, updatedExpiry) => {
    const { error } = await supabase
      .from('subscribers')
      .update({ expiry: updatedExpiry })
      .eq('id', id);

    if (!error) {
      setSubscribers((prev) =>
        prev.map((sub) => (sub.id === id ? { ...sub, expiry: updatedExpiry } : sub))
      );
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
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this subscriber?')) return;

    const { error } = await supabase.from('subscribers').delete().eq('id', id);
    if (!error) {
      setSubscribers((prev) => prev.filter((sub) => sub.id !== id));
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!user || !adminEmails.includes(user.email))
    return <p className="p-6 text-red-600">Access Denied</p>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4">
      <h1 className="text-2xl font-bold">🛠 Edit Subscribers</h1>
      <p className="text-gray-700">Total Subscribers: {subscribers.length}</p>

      <input
        type="text"
        placeholder="Search by email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded px-3 py-2 text-sm"
      />

      {filteredSubscribers.length === 0 ? (
        <p className="text-gray-500 mt-4">No subscribers found.</p>
      ) : (
        <ul className="space-y-4 mt-4">
          {filteredSubscribers.map((sub) => (
            <li
              key={sub.id}
              className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white shadow-sm"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{sub.email}</p>
                <p className="text-xs text-red-600 font-mono">
                  {countdowns[sub.id] || '...'}
                </p>
              </div>

              <div className="flex-1">
                <label className="block text-xs mb-1">Expiry:</label>
                <input
                  type="datetime-local"
                  defaultValue={new Date(sub.expiry).toISOString().slice(0, 16)}
                  onChange={(e) => handleUpdate(sub.id, e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>

              <div className="flex-1">
                <label className="block text-xs mb-1">Remarks:</label>
                <input
                  type="text"
                  defaultValue={sub.remarks || ''}
                  onBlur={(e) => handleRemarksChange(sub.id, e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <span className="text-green-600 text-xs">Auto-saves</span>
                <button
                  onClick={() => handleDelete(sub.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

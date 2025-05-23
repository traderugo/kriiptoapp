import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function EditSubscribers() {
  const [user, setUser] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [adminEmails, setAdminEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdowns, setCountdowns] = useState({});
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchUserAndSubscribers = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoading(false);
        return;
      }

      const userEmail = session.user.email.toLowerCase().trim();
      setUser(session.user);

      const { data: admins, error } = await supabase
        .from('admins')
        .select('admin_email');

      if (error) {
        console.error('Error fetching admins:', error.message);
        setLoading(false);
        return;
      }

      const emails = admins.map((admin) => admin.admin_email.toLowerCase().trim());
      setAdminEmails(emails);

      console.log('Logged in user email:', userEmail);
      console.log('Admin emails:', emails);
      console.log('Is user admin:', emails.includes(userEmail));

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

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const updateRemarks = async (id, newRemarks) => {
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

  const debouncedRemarksChange = useCallback(debounce(updateRemarks, 600), []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return;

    const { error } = await supabase.from('subscribers').delete().eq('id', id);

    if (!error) {
      setSubscribers((prev) => prev.filter((sub) => sub.id !== id));
    }
  };

  const filteredSubscribers = subscribers.filter((sub) =>
    sub.email.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <p className="p-6">Loading...</p>;
  if (!user || !adminEmails.includes(user.email.toLowerCase().trim())) {
    return <p className="p-6 text-red-600">Access Denied</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">🛠 Edit Subscribers</h1>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-1">
          Total Subscribers: <strong>{filteredSubscribers.length}</strong>
        </p>
        <input
          type="text"
          placeholder="Filter by email..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full sm:w-1/2 border px-3 py-2 rounded text-sm"
        />
      </div>

      {filteredSubscribers.length === 0 ? (
        <p>No subscribers found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-left text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Email</th>
                <th className="p-2">Expiry</th>
                <th className="p-2">Time Left</th>
                <th className="p-2">Remarks</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.map((sub) => (
                <tr key={sub.id} className="border-t">
                  <td className="p-2">{sub.email}</td>
                  <td className="p-2">
                    <input
                      type="datetime-local"
                      defaultValue={new Date(sub.expiry).toISOString().slice(0, 16)}
                      onBlur={(e) => handleUpdate(sub.id, e.target.value)}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="p-2 text-xs text-red-600 font-mono">
                    {countdowns[sub.id] || '...'}
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      defaultValue={sub.remarks || ''}
                      onChange={(e) => debouncedRemarksChange(sub.id, e.target.value)}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

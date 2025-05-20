import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function EditSubscribers() {
  const [user, setUser] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [adminEmails, setAdminEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdowns, setCountdowns] = useState({});

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

  if (loading) return <p className="p-6">Loading...</p>;
  if (!user || !adminEmails.includes(user.email)) {
    return <p className="p-6 text-red-600">Access Denied</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">🛠 Edit Subscribers</h1>

      {subscribers.length === 0 ? (
        <p>No subscribers found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-left text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 whitespace-nowrap">Email</th>
                <th className="p-2 whitespace-nowrap">Expiry</th>
                <th className="p-2 whitespace-nowrap">Time Left</th>
                <th className="p-2 whitespace-nowrap">Remarks</th>
                <th className="p-2 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub.id} className="border-t">
                  <td className="p-2">{sub.email}</td>
                  <td className="p-2">
                    <input
                      type="datetime-local"
                      defaultValue={new Date(sub.expiry).toISOString().slice(0, 16)}
                      onChange={(e) => handleUpdate(sub.id, e.target.value)}
                      className="border rounded px-2 py-1 w-full text-xs sm:text-sm"
                    />
                  </td>
                  <td className="p-2 text-xs sm:text-sm text-red-600 font-mono">
                    {countdowns[sub.id] || '...'}
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      defaultValue={sub.remarks || ''}
                      onBlur={(e) => handleRemarksChange(sub.id, e.target.value)}
                      className="border rounded px-2 py-1 w-full text-xs sm:text-sm"
                    />
                  </td>
                  <td className="p-2 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span className="text-green-600 text-xs sm:text-sm">Auto-saves</span>
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-xs sm:text-sm"
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

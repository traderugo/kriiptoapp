import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function EditSubscribers() {
  const [user, setUser] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [adminEmails, setAdminEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndSubscribers = async () => {
      // Step 1: Get current user session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoading(false);
        return;
      }

      const userEmail = session.user.email;
      setUser(session.user);

      // Step 2: Fetch all admin emails
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

      // Step 3: Check if current user is an admin
      if (!emails.includes(userEmail)) {
        setLoading(false);
        return;
      }

      // Step 4: Fetch subscribers
      const { data, error: subError } = await supabase
        .from('subscribers')
        .select('*');

      if (!subError) setSubscribers(data);
      setLoading(false);
    };

    fetchUserAndSubscribers();
  }, []);

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
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🛠 Edit Subscribers</h1>

      {subscribers.length === 0 ? (
        <p>No subscribers found.</p>
      ) : (
        <table className="w-full border border-gray-300 text-left">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Email</th>
              <th className="p-2">Expiry</th>
              <th className="p-2">Actions</th>
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
                    className="border rounded px-2 py-1"
                  />
                </td>
                <td className="p-2 flex items-center space-x-2">
                  <span className="text-green-600 text-sm">Auto-saves</span>
                  <button
                    onClick={() => handleDelete(sub.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

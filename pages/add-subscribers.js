import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Spinner from '../components/Spinner';

export default function AddSubscriber() {
  const [email, setEmail] = useState('');
  const [expiry, setExpiry] = useState('');
  const [affiliate, setAffiliate] = useState(''); // new affiliate state
  const [user, setUser] = useState(null);
  const [adminEmails, setAdminEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoading(false);
        return;
      }

      setUser(session.user);

      const { data: admins, error } = await supabase.from('admins').select('email');

      if (error) {
        console.error('Error fetching admins:', error.message);
        setLoading(false);
        return;
      }

      const emails = admins.map((admin) => admin.email);
      setAdminEmails(emails);

      setLoading(false);
    };

    checkAdminAccess();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    const { data, error } = await supabase.from('subscribers').upsert([
      { email, expiry, affiliate }
    ]);

    setSubmitting(false);

    if (error) {
      alert('Error adding subscription: ' + error.message);
    } else {
      alert('Subscription added successfully!');
      setEmail('');
      setExpiry('');
      setAffiliate('');
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!user || !adminEmails.includes(user.email)) {
    return <p className="p-6 text-red-600">Access Denied</p>;
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Add Subscriber</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="User Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="datetime-local"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Affiliate (optional)"
          value={affiliate}
          onChange={(e) => setAffiliate(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          disabled={submitting}
          className={`bg-blue-600 text-white px-4 py-2 rounded ${
            submitting ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          {submitting ? (
            <span className="flex items-center justify-center space-x-2">
              <Spinner />
              <span>Adding...</span>
            </span>
          ) : (
            'Add Subscription'
          )}
        </button>
      </form>
    </div>
  );
}

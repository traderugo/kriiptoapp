import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AddSignals() {
  const [signals, setSignals] = useState([]);
  const [form, setForm] = useState({
    pair: '',
    direction: 'buy',
    entry: '',
    sl: '',
    tp: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [user, setUser] = useState(null);
  const [adminEmails, setAdminEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData?.session?.user;

      if (!sessionUser) {
        setLoading(false);
        return;
      }

      const { data: admins, error } = await supabase.from('admins').select('email');
      if (error) {
        console.error('Error fetching admin list:', error.message);
        setLoading(false);
        return;
      }

      const emails = admins.map((admin) => admin.email);
      setAdminEmails(emails);

      if (emails.includes(sessionUser.email)) {
        setUser(sessionUser);
        fetchSignals(); // only fetch if admin
      }

      setLoading(false);
    };

    checkAdmin();
  }, []);

  const fetchSignals = async () => {
    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setSignals(data);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (editingId) {
      const { error } = await supabase
        .from('signals')
        .update(form)
        .eq('id', editingId);

      if (!error) {
        setEditingId(null);
        setForm({ pair: '', direction: 'buy', entry: '', sl: '', tp: '' });
        fetchSignals();
      }
    } else {
      const { error } = await supabase.from('signals').insert([form]);
      if (!error) {
        setForm({ pair: '', direction: 'buy', entry: '', sl: '', tp: '' });
        fetchSignals();
      }
    }
  };

  const handleEdit = (signal) => {
    setForm(signal);
    setEditingId(signal.id);
  };

  const handleDelete = async (id) => {
    if (!user) return;
    await supabase.from('signals').delete().eq('id', id);
    fetchSignals();
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!user) return <p className="p-6 text-red-600">Access Denied</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">⚙️ Add / Edit Signals</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input name="pair" placeholder="Pair (e.g. XAUUSD)" value={form.pair} onChange={handleChange} className="w-full p-2 border rounded" required />
        <select name="direction" value={form.direction} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
        <input name="entry" type="number" step="any" placeholder="Entry" value={form.entry} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="sl" type="number" step="any" placeholder="Stop Loss" value={form.sl} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="tp" type="number" step="any" placeholder="Take Profit" value={form.tp} onChange={handleChange} className="w-full p-2 border rounded" required />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          {editingId ? 'Update Signal' : 'Add Signal'}
        </button>
      </form>

      <ul className="space-y-4">
        {signals.map((signal) => (
          <li key={signal.id} className="p-4 border rounded bg-gray-100 flex justify-between items-start">
            <div>
              <p>
                {signal.direction === 'buy' ? '📈' : '📉'} {signal.pair} @ {signal.entry} <br />
                SL: {signal.sl} | TP: {signal.tp} <br />
              </p>
            </div>
            <div className="space-x-2">
              <button onClick={() => handleEdit(signal)} className="text-blue-600">Edit</button>
              <button onClick={() => handleDelete(signal.id)} className="text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

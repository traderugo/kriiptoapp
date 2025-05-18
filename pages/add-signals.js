import { useEffect, useState } from 'react';
import Spinner from "../components/Spinner";
import { supabase } from '../lib/supabase';
import imageCompression from 'browser-image-compression';

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
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null); // new: compressed image file

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
        await fetchSignals();
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

  // New: handle image file change and compress
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      setImageFile(compressedFile);
      console.log('Original size:', (file.size / 1024).toFixed(2), 'KB');
      console.log('Compressed size:', (compressedFile.size / 1024).toFixed(2), 'KB');
    } catch (error) {
      console.error('Image compression error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);

    try {
      let imageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from('signals-images') // Make sure you created this bucket
          .upload(fileName, imageFile, { upsert: true });

        if (error) throw error;

        const { publicURL, error: urlError } = supabase.storage
          .from('signals-images')
          .getPublicUrl(fileName);

        if (urlError) throw urlError;
        imageUrl = publicURL;
      }

      const payload = { ...form, image_url: imageUrl };

      if (editingId) {
        const { error } = await supabase
          .from('signals')
          .update(payload)
          .eq('id', editingId);

        if (!error) {
          setEditingId(null);
          setForm({ pair: '', direction: 'buy', entry: '', sl: '', tp: '' });
          setImageFile(null);
          await fetchSignals();
        }
      } else {
        const { error } = await supabase.from('signals').insert([payload]);
        if (!error) {
          setForm({ pair: '', direction: 'buy', entry: '', sl: '', tp: '' });
          setImageFile(null);
          await fetchSignals();
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
    }

    setSubmitting(false);
  };

  const handleEdit = (signal) => {
    setForm(signal);
    setEditingId(signal.id);
    setImageFile(null); // reset image on edit, or you can preload image if you want
  };

  const handleDelete = async (id) => {
    if (!user) return;
    await supabase.from('signals').delete().eq('id', id);
    fetchSignals();
  };

  if (loading) return <Spinner />;
  if (!user) return <p className="p-6 text-red-600">Access Denied</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">⚙️ Add / Edit Signals</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          name="pair"
          placeholder="Pair (e.g. XAUUSD)"
          value={form.pair}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <select
          name="direction"
          value={form.direction}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
        <input
          name="entry"
          type="number"
          step="any"
          placeholder="Entry"
          value={form.entry}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="sl"
          type="number"
          step="any"
          placeholder="Stop Loss"
          value={form.sl}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="tp"
          type="number"
          step="any"
          placeholder="Take Profit"
          value={form.tp}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        {/* New file input */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          disabled={submitting}
          className={`px-4 py-2 rounded text-white ${
            submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600'
          }`}
        >
          {submitting ? (
            <span className="flex items-center space-x-2 justify-center">
              <Spinner />
              <span>{editingId ? 'Updating...' : 'Adding...'}</span>
            </span>
          ) : (
            editingId ? 'Update Signal' : 'Add Signal'
          )}
        </button>
      </form>

      <ul className="space-y-4">
        {signals.map((signal) => (
          <li
            key={signal.id}
            className="p-4 border rounded bg-gray-100 flex justify-between items-start"
          >
            <div>
              <p>
                {signal.direction === 'buy' ? '📈' : '📉'} {signal.pair} @ {signal.entry} <br />
                SL: {signal.sl} | TP: {signal.tp} <br />
                {signal.image_url && (
                  <img src={signal.image_url} alt="Signal Image" className="mt-2 max-w-xs rounded" />
                )}
              </p>
            </div>
            <div className="space-x-2">
              <button onClick={() => handleEdit(signal)} className="text-blue-600">
                Edit
              </button>
              <button onClick={() => handleDelete(signal.id)} className="text-red-600">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

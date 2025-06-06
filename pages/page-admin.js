import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Spinner from '../components/Spinner';

export default function Admins() {
  const [admins, setAdmins] = useState([]);
  const [email, setEmail] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('admins').select('*');
    if (!error) setAdmins(data);
    setLoading(false);
  };

  const addOrUpdateAdmin = async () => {
    if (!email) return;

    setSubmitting(true);

    if (editingId) {
      const { error } = await supabase
        .from('admins')
        .update({ email })
        .eq('id', editingId);

      if (!error) {
        setEditingId(null);
        setEmail('');
        await fetchAdmins();
      }
    } else {
      const { error } = await supabase.from('admins').insert({ email });
      if (!error) {
        setEmail('');
        await fetchAdmins();
      }
    }

    setSubmitting(false);
  };

  const startEditing = (admin) => {
    setEditingId(admin.id);
    setEmail(admin.email);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEmail('');
  };

  const deleteAdmin = async (id) => {
    setSubmitting(true);
    const { error } = await supabase.from('admins').delete().eq('id', id);
    if (!error) await fetchAdmins();
    setSubmitting(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">👮 Admin Users Page</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border px-3 py-2 rounded w-full"
          disabled={submitting}
        />
        <button
          onClick={addOrUpdateAdmin}
          disabled={submitting}
          className={`bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center ${
            submitting ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          {submitting ? <Spinner /> : editingId ? 'Update' : 'Add'}
        </button>
        {editingId && (
          <button
            onClick={cancelEditing}
            disabled={submitting}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading admins...</p>
      ) : (
        <ul className="space-y-2">
          {admins.map((admin) => (
            <li
              key={admin.id}
              className="flex justify-between items-center bg-gray-100 p-3 rounded"
            >
              <span>{admin.email}</span>
              <div className="space-x-2">
                <button
                  onClick={() => startEditing(admin)}
                  disabled={submitting}
                  className="text-blue-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteAdmin(admin.id)}
                  disabled={submitting}
                  className="text-red-500"
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

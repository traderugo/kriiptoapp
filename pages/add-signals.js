import { useEffect, useState } from 'react';
import Spinner from "../components/Spinner";
import { supabase } from '../lib/supabase';

export default function AddSignals() {
  const [signals, setSignals] = useState([]);
  const [form, setForm] = useState({
    pair: '',
    direction: 'buy',
    entry: '',
    sl: '',
    tp: '',
    risk: '',
    outcome: '',
    remarks: '',
    capital: '',
    leverage: '',
    admin_email: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [user, setUser] = useState(null);
  const [adminEmails, setAdminEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const signalsPerPage = 5;
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
  const { data: sessionData } = await supabase.auth.getSession();
  const sessionUser = sessionData?.session?.user;

  if (!sessionUser) {
    setLoading(false);
    return;
  }

  const { data: adminData, error } = await supabase
    .from('admins')
    .select('admin_email')
    .eq('email', sessionUser.email)
    .single();

  if (error || !adminData) {
    console.error('Error fetching admin record:', error?.message || 'Not found');
    setLoading(false);
    return;
  }

  setUser(sessionUser);
  setForm((prev) => ({ ...prev, admin_email: adminData.admin_email }));
  await fetchSignals(1);
  setLoading(false);
};


    checkAdmin();
  }, []);

  const fetchSignals = async (page = 1) => {
    const from = (page - 1) * signalsPerPage;
    const to = from + signalsPerPage - 1;

    const { data, error, count } = await supabase
      .from('signals')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!error) {
      setSignals(data);
      setHasMore((page * signalsPerPage) < count);
      setCurrentPage(page);
    }
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

    setSubmitting(true);

    if (editingId) {
      const { error } = await supabase
        .from('signals')
        .update(form)
        .eq('id', editingId);

      if (!error) {
        setEditingId(null);
        resetForm();
        await fetchSignals(currentPage);
      }
    } else {
      const { error } = await supabase.from('signals').insert([form]);
      if (!error) {
        resetForm();
        await fetchSignals(currentPage);
      }
    }

    setSubmitting(false);
  };

  const resetForm = () => {
    setForm({
      pair: '',
      direction: 'buy',
      entry: '',
      sl: '',
      tp: '',
      risk: '',
      outcome: '',
      remarks: '',
      capital: '',
      leverage: '',
      admin_email: user?.email || '',
    });
  };

  const handleEdit = (signal) => {
    setForm(signal);
    setEditingId(signal.id);
  };

  const handleDelete = async (id) => {
    if (!user) return;
    await supabase.from('signals').delete().eq('id', id);
    fetchSignals(currentPage);
  };

  if (loading) return <Spinner />;
  if (!user) return <p className="p-6 text-red-600">Access Denied</p>;

  // Calculated values
  const capital = parseFloat(form.capital);
  const leverage = parseFloat(form.leverage);
  const entry = parseFloat(form.entry);
  const sl = parseFloat(form.sl);
  const tp = parseFloat(form.tp);
  const riskPercent = parseFloat(form.risk);

  const priceDiff = entry && sl ? Math.abs(entry - sl) : null;
  const priceDiffTp = entry && tp ? Math.abs(tp - entry) : null;
  const riskAmount = capital && riskPercent ? (capital * riskPercent) / 100 : null;
  const positionSize = riskAmount && priceDiff ? riskAmount / priceDiff : null;
  const notionalSize = positionSize && entry ? positionSize * entry : null;
  const marginRequired = notionalSize && leverage ? notionalSize / leverage : null;
  const riskReward = priceDiff && priceDiffTp ? priceDiffTp / priceDiff : null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">⚙️ Add / Edit Signals</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        {[
          { label: "Pair", name: "pair", type: "text" },
          { label: "Direction", name: "direction", type: "select", options: ["buy", "sell"] },
          { label: "Entry", name: "entry", type: "number" },
          { label: "Take Profit", name: "tp", type: "number" },
          { label: "Stop Loss", name: "sl", type: "number" },
          { label: "Risk (%)", name: "risk", type: "number" },
          { label: "Capital", name: "capital", type: "number" },
          { label: "Leverage", name: "leverage", type: "number" },
          { label: "Remarks", name: "remarks", type: "text" },
          { label: "Outcome", name: "outcome", type: "select", options: ["", "win", "loss", "breakeven"] },
          { label: "Admin Email", name: "admin_email", type: "text", readOnly: true },
        ].map(({ label, name, type, options, readOnly }) => (
          <div key={name} className="flex items-center space-x-4">
            <label htmlFor={name} className="w-32 font-medium text-gray-700">{label}:</label>
            {type === "select" ? (
              <select
                name={name}
                id={name}
                value={form[name]}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                {options.map(opt => (
                  <option key={opt} value={opt}>{opt === '' ? 'Select Outcome' : opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                ))}
              </select>
            ) : (
              <input
                name={name}
                id={name}
                type={type}
                step={type === "number" ? "any" : undefined}
                value={form[name]}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                readOnly={readOnly}
                required={!readOnly}
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={submitting}
          className={`px-4 py-2 rounded text-white ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600'}`}
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

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-md space-y-2 mb-8">
        <h2 className="font-semibold text-blue-700">📊 Calculated Info</h2>
        <p><strong>Capital:</strong> {form.capital || 'N/A'}</p>
        <p><strong>Leverage:</strong> {form.leverage || 'N/A'}</p>
        <p><strong>Entry:</strong> {form.entry || 'N/A'}</p>
        <p><strong>Take Profit:</strong> {form.tp || 'N/A'}</p>
        <p><strong>Stop Loss:</strong> {form.sl || 'N/A'}</p>
        <p><strong>Risk (%):</strong> {form.risk || 'N/A'}</p>
        <hr />
        <p><strong>Risk Amount:</strong> {riskAmount !== null ? riskAmount.toFixed(2) : 'N/A'}</p>
        <p><strong>Risk Reward:</strong> {riskReward !== null ? riskReward.toFixed(2) : 'N/A'}</p>
        <p><strong>Notional Size:</strong> {notionalSize !== null ? notionalSize.toFixed(2) : 'N/A'}</p>
        <p><strong>Margin Required:</strong> {marginRequired !== null ? marginRequired.toFixed(2) : 'N/A'}</p>
      </div>

      <ul className="space-y-4">
        {signals.map((signal) => (
          <li key={signal.id} className="p-4 border rounded bg-gray-100 flex justify-between items-start">
            <div>
              <p>
                {new Date(signal.created_at).toLocaleString('en')}<br />
                {signal.direction === 'buy' ? '📈' : '📉'} {signal.pair} @ {signal.entry} <br />
                SL: {signal.sl} | TP: {signal.tp} <br />
              </p>
            </div>
            <div className="space-x-2">
              <button onClick={() => handleEdit(signal)} className="text-blue-600">Edit</button>
              <button onClick={() => handleDelete(signal.id)} className="text-red-600">X</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => fetchSignals(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => fetchSignals(currentPage + 1)}
          disabled={!hasMore}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

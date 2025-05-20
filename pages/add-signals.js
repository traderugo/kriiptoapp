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
  });
  const [editingId, setEditingId] = useState(null);
  const [user, setUser] = useState(null);
  const [adminEmails, setAdminEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Pagination
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
        await fetchSignals(1);
      }

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
        setForm({
          pair: '',
          direction: 'buy',
          entry: '',
          sl: '',
          tp: '',
          risk: '',
          outcome: '',
          leverage: '',
          capital: '',
          remarks: ''
        });
        await fetchSignals(currentPage);
      }
    } else {
      const { error } = await supabase.from('signals').insert([form]);
      if (!error) {
        setForm({
          pair: '',
          direction: 'buy',
          entry: '',
          sl: '',
          tp: '',
          risk: '',
          outcome: '',
          leverage: '',
          capital: '',
          remarks: ''
        });
        await fetchSignals(currentPage);
      }
    }

    setSubmitting(false);
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

  // Calculated fields
const capital = parseFloat(form.capital);
const leverage = parseFloat(form.leverage);
const entry = parseFloat(form.entry);
const sl = parseFloat(form.sl);
const riskPercent = parseFloat(form.risk);

const priceDiff = entry && sl ? Math.abs(entry - sl) : null;
const riskAmount = capital && riskPercent ? (capital * riskPercent) / 100 : null;
const positionSize = riskAmount && priceDiff ? riskAmount / priceDiff : null;
const notionalSize = positionSize && entry ? positionSize * entry : null;
const marginRequired = notionalSize && leverage ? notionalSize / leverage : null;


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
        <input name="tp" type="number" step="any" placeholder="Take Profit" value={form.tp} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="sl" type="number" step="any" placeholder="Stop Loss" value={form.sl} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="risk" type="number" step="any" placeholder="Risk(%)" value={form.risk} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="capital" type="number" step="any" placeholder="Capital" value={form.capital} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="leverage" type="number" step="any" placeholder="Leverage" value={form.leverage} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="remarks" type="text" placeholder="Type your remarks here" value={form.remarks} onChange={handleChange} className="w-full p-2 border rounded" required />
        <select name="outcome" value={form.outcome} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="">Select Outcome</option>
          <option value="win">Win</option>
          <option value="lose">Lose</option>
          <option value="breakeven">Break Even</option>
        </select>
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
  <p><strong>Risk Amount:</strong> {riskAmount !== null ? riskAmount.toFixed(2) : 'N/A'}</p>
  <p><strong>Position Size:</strong> {positionSize !== null ? positionSize.toFixed(2) : 'N/A'}</p>
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

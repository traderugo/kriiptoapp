import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function MentorshipAdmissions() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    experience: '',
    markets: [],
    platform: '',
    motivation: '',
    goals: '',
    hours_commit: '',
    has_access: '',
    agree_rules: '',
    payment_method: '',
  });

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    const { data, error } = await supabase.from('mentorship_forms').select('*');
    if (!error) setSubmissions(data);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { data, error } = await supabase.from('mentorship_forms').insert([formData]);
    if (!error) {
      setFormData({
        name: '', email: '', phone: '', country: '', experience: '',
        markets: [], platform: '', motivation: '', goals: '',
        hours_commit: '', has_access: '', agree_rules: '', payment_method: ''
      });
      fetchSubmissions();
    } else {
      alert('Error submitting form.');
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        markets: checked
          ? [...prev.markets, value]
          : prev.markets.filter((m) => m !== value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📥 Crypto Mentorship Admission</h1>

      <form onSubmit={handleSubmit} className="grid gap-4 mb-8">
        <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="border p-2 rounded" />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="border p-2 rounded" />
        <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="border p-2 rounded" />
        <input name="country" placeholder="Country / Time Zone" value={formData.country} onChange={handleChange} className="border p-2 rounded" />

        <select name="experience" value={formData.experience} onChange={handleChange} className="border p-2 rounded">
          <option value="">-- Experience Level --</option>
          <option value="none">No experience</option>
          <option value="<6 months">Less than 6 months</option>
          <option value="6-12 months">6–12 months</option>
          <option value="1-2 years">1–2 years</option>
          <option value=">2 years">More than 2 years</option>
        </select>

        <fieldset className="flex gap-4">
          <legend className="text-sm font-semibold">Markets Traded</legend>
          {['Forex', 'Crypto', 'Stocks', 'Others'].map((market) => (
            <label key={market} className="text-sm">
              <input
                type="checkbox"
                name="markets"
                value={market}
                checked={formData.markets.includes(market)}
                onChange={handleChange}
              />{' '}{market}
            </label>
          ))}
        </fieldset>

        <input name="platform" placeholder="Platform or broker used" value={formData.platform} onChange={handleChange} className="border p-2 rounded" />
        <textarea name="motivation" placeholder="Why do you want to join?" value={formData.motivation} onChange={handleChange} className="border p-2 rounded" />
        <textarea name="goals" placeholder="What are your trading goals?" value={formData.goals} onChange={handleChange} className="border p-2 rounded" />

        <select name="hours_commit" value={formData.hours_commit} onChange={handleChange} className="border p-2 rounded">
          <option value="">-- Weekly Commitment --</option>
          <option value="<5">Less than 5 hours/week</option>
          <option value="5-10">5–10 hours/week</option>
          <option value=">10">More than 10 hours/week</option>
        </select>

        <select name="has_access" value={formData.has_access} onChange={handleChange} className="border p-2 rounded">
          <option value="">Do you have a computer + internet?</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>

        <select name="agree_rules" value={formData.agree_rules} onChange={handleChange} className="border p-2 rounded">
          <option value="">Do you agree to follow rules?</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>

        <select name="payment_method" value={formData.payment_method} onChange={handleChange} className="border p-2 rounded">
          <option value="">Preferred Payment Method</option>
          <option value="crypto">Crypto</option>
          <option value="fiat">Fiat (Bank/Transfer)</option>
        </select>

        <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Submit Application</button>
      </form>

      <h2 className="text-xl font-semibold mb-2">📄 Submitted Applications</h2>
      {loading ? (
        <p>Loading...</p>
      ) : submissions.length === 0 ? (
        <p>No submissions yet.</p>
      ) : (
        <ul className="space-y-2">
          {submissions.map((entry) => (
            <li key={entry.id} className="border rounded p-4 bg-white">
              <p className="font-bold">{entry.name} ({entry.email})</p>
              <p className="text-sm">Experience: {entry.experience} | Markets: {entry.markets?.join(', ')}</p>
              <p className="text-sm">Motivation: {entry.motivation}</p>
              <p className="text-sm">Goals: {entry.goals}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

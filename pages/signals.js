import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Signals() {
  const [user, setUser] = useState(null);
  const [subscriber, setSubscriber] = useState(null);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const getUserAndSubscription = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoading(false);
        return;
      }

      const email = session.user.email;
      setUser(session.user);

      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('email', email)
        .single();

      if (!error) setSubscriber(data);
      setLoading(false);
    };

    getUserAndSubscription();
  }, []);

  useEffect(() => {
    if (!subscriber) return;

    const interval = setInterval(() => {
      const expiry = new Date(subscriber.expiry).getTime();
      const now = new Date().getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        clearInterval(interval);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [subscriber]);

  useEffect(() => {
    const fetchSignals = async () => {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth)
        .order('created_at', { ascending: false });

      if (!error) setSignals(data);
    };

    if (subscriber) {
      fetchSignals();
    }
  }, [subscriber, currentDate]);

  if (loading) return <p className="p-6 text-center">Loading...</p>;
  if (!user) return <p className="p-6 text-red-600 text-center">Access Denied</p>;
  if (!subscriber) return <p className="p-6 text-red-600 text-center">No subscription found</p>;

  const isExpired = new Date() > new Date(subscriber.expiry);
  if (isExpired) return <p className="p-6 text-red-600 text-center">Subscription expired</p>;

  const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const outcomesCount = signals.reduce(
    (acc, signal) => {
      const outcome = signal.outcome?.toLowerCase();
      const { entry, sl, tp, direction } = signal;

      if (outcome === 'win') acc.wins += 1;
      else if (outcome === 'loss') acc.losses += 1;
      else if (outcome === 'breakeven') acc.breakeven += 1;

      acc.total += 1;

      if (entry && sl && tp && direction) {
        let rr = 0;
        if (direction.toLowerCase() === 'buy') {
          rr = (tp - entry) / (entry - sl);
        } else if (direction.toLowerCase() === 'sell') {
          rr = (entry - tp) / (sl - entry);
        }

        if (isFinite(rr) && rr > 0 && outcome === 'win') {
          acc.totalRR += rr;
        }
      }

      return acc;
    },
    { wins: 0, losses: 0, breakeven: 0, total: 0, totalRR: 0 }
  );

  const totalTrades = outcomesCount.wins + outcomesCount.losses + outcomesCount.breakeven;
  const winRate = totalTrades > 0 ? ((outcomesCount.wins / totalTrades) * 100).toFixed(2) : '0.00';

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-green-700">📡 Trading Signals</h1>
      <p className="mb-2">Welcome, {user.email}</p>
      <p className="mb-2 text-sm text-gray-600">
        Subscription expires: {new Date(subscriber.expiry).toLocaleString()}
      </p>
      <p className="mb-4 font-mono text-lg text-red-600">⏳ Time left: {timeLeft}</p>

      <div className="shadow-md">
        <div className="mb-4 space-y-2">
          <div className="flex flex-col gap-2 bg-gray-100 p-3 rounded text-sm text-gray-700">
            <span>✅ Wins: <strong className="text-green-600">{outcomesCount.wins}</strong></span>
            <span>❌ Losses: <strong className="text-red-600">{outcomesCount.losses}</strong></span>
            <span>⚖️ Breakeven: <strong className="text-yellow-600">{outcomesCount.breakeven}</strong></span>
            <span>📊 Win Rate: <strong className="text-blue-600">{winRate}%</strong></span>
            <span>📈 Derived RR (Wins Only): <strong className="text-purple-600">{(outcomesCount.totalRR-outcomesCount.losses).toFixed(2)}</strong></span>
          </div>

          <div className="flex justify-between items-center">
            <button onClick={goToPreviousMonth} className="bg-blue-500 text-white px-3 py-1 rounded">
              ⬅️ Prev
            </button>
            <span className="font-semibold px-4 text-gray-700">{monthYear}</span>
            <button onClick={goToNextMonth} className="bg-blue-500 text-white px-3 py-1 rounded">
              Next ➡️
            </button>
          </div>
        </div>

        <ul className="space-y-2 mb-4">
          {signals.length > 0 ? (
            signals.map((signal) => {
              const rr =
                signal.direction?.toLowerCase() === 'buy'
                  ? ((signal.tp - signal.entry) / (signal.entry - signal.sl)).toFixed(2)
                  : ((signal.entry - signal.tp) / (signal.sl - signal.entry)).toFixed(2);
              return (
                <li key={signal.id} className="flex flex-col space-y-1 bg-gray-50 p-4 rounded-lg ">
                  <span>
                    <strong >
                      {new Date(signal.created_at).toLocaleString('en')} <br />
                      <span  className=' space-y-1 bg-gray-50 text-green-800'>{signal.direction === 'buy' ? '📈 LONG' : '📉 SHORT'} {signal.pair.toUpperCase()}/USDT <hr />ENTRY: {signal.entry}</span>
                    </strong>
                    <br />
                    SL: {signal.sl} - TP: {signal.tp}<br />
                    RR: {rr}, <strong className=' space-y-1 bg-gray-50 text-blue-500'> {signal.outcome.toUpperCase()}</strong><br />
                    <small>Remarks: {signal.remarks}</small><br />
                    <small>{signal.admin_email}</small><br />
                    
                  </span>
                </li>
              );
            })
          ) : (
            <li className="text-gray-500 italic">No signals for this month</li>
          )}
        </ul>
      </div>
    </div>
  );
}
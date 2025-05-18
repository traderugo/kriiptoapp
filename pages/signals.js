import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Signals() {
  const [user, setUser] = useState(null);
  const [subscriber, setSubscriber] = useState(null);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

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

  // Countdown Logic
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
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [subscriber]);

  // Fetch Signals
  useEffect(() => {
    const fetchSignals = async () => {
      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .eq('visible', true)
        .order('created_at', { ascending: false });

      if (!error) setSignals(data);
    };

    if (subscriber) {
      fetchSignals();
    }
  }, [subscriber]);

  if (loading) return <p className="p-6 text-center">Loading...</p>;
  if (!user) return <p className="p-6 text-red-600 text-center">Access Denied</p>;
  if (!subscriber) return <p className="p-6 text-red-600 text-center">No subscription found</p>;

  const isExpired = new Date() > new Date(subscriber.expiry);
  if (isExpired) return <p className="p-6 text-red-600 text-center">Subscription expired</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-green-700">📡 Trading Signals</h1>
      <p className="mb-2">Welcome, {user.email}</p>
      <p className="mb-2 text-sm text-gray-600">
        Subscription expires: {new Date(subscriber.expiry).toLocaleString()}
      </p>
      <p className="mb-4 font-mono text-lg text-red-600">⏳ Time left: {timeLeft}</p>

      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        <div className="bg-gray-100 rounded-lg">
          <div className="max-h-96 overflow-y-auto pr-2"> {/* scrollable wrapper */}
            <ul className="space-y-2">
              {signals.length > 0 ? (
                signals.map((signal) => (
                  <li key={signal.id} className="flex flex-col space-y-1">
                    <span>
                      {signal.direction === 'buy' ? '📈' : '📉'}{' '}
                      {signal.direction.toUpperCase()} {signal.pair} @ {signal.entry}, SL: {signal.sl}, TP: {signal.tp}
                    </span>
                    {signal.image_url && (
                      <img
                        src={signal.image_url}
                        alt={`${signal.pair} signal image`}
                        className="max-w-xs rounded shadow mt-1"
                      />
                    )}
                  </li>
                ))
              ) : (
                <li className="text-gray-500 italic">No signals available</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

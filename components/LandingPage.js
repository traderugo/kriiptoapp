import { useState, useEffect } from 'react';
import Image from 'next/image';
import Head from 'next/head';

export default function MasterclassPage() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const eventDate = new Date('2025-06-10T18:00:00');

    const updateCountdown = () => {
      const now = new Date();
      const diff = eventDate - now;

      if (diff <= 0) {
        setTimeLeft('Masterclass is live now!');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>Intro to Crypto Masterclass</title>
      </Head>
      <main className="min-h-screen bg-gray-100 p-4 text-gray-800">
        <section className="max-w-4xl mx-auto text-center p-6">
          <h1 className="text-4xl font-bold mb-4">🚀 Intro to Crypto Masterclass</h1>
          <p className="text-lg mb-6">Learn the basics of cryptocurrency, trading strategies, and how to navigate the crypto jungle like a pro.</p>
          <div className="text-2xl font-semibold text-blue-600 mb-6">⏳ {timeLeft}</div>
          <a href="https://chat.whatsapp.com/YOUR-GROUP-LINK" target="_blank" rel="noopener noreferrer">
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded text-lg">Join WhatsApp Group</button>
          </a>
        </section>
        
        <section className="max-w-4xl mx-auto p-6">
          <h2 className="text-2xl font-bold text-center mb-6">🌟 What Others Are Saying</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded shadow">
              <p className="italic">"Clear, powerful and no fluff. I finally understand how crypto works!"</p>
              <p className="mt-2 font-semibold">- Ada, Nigeria</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <p className="italic">"This class gave me the confidence to start investing smartly."</p>
              <p className="mt-2 font-semibold">- Tunde, Ghana</p>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto p-6">
          <h2 className="text-2xl font-bold text-center mb-6">📸 Moments from Our Last Class</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
           
          </div>
        </section>

        <footer className="text-center text-sm text-gray-600 mt-12">
          Made with ❤️ by Trader Ugo
        </footer>
      </main>
    </>
  );
}

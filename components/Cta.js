// lib/MasterclassBanner.js
import { useEffect, useState } from "react";

export default function MasterclassBanner() {
  const [countdown, setCountdown] = useState("Loading...");

  useEffect(() => {
    const targetDate = new Date("2025-06-01T18:00:00Z");

    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        setCountdown("🎉 It's happening now!");
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg shadow-lg text-center">
      <h2 className="text-2xl font-bold mb-2">🚀 Intro to Crypto Masterclass</h2>
      <p className="text-lg mb-4">
        Unlock the fundamentals of crypto trading and investing in this one-time event!
      </p>
      <p className="text-md font-semibold mb-4">
        Starts in: <span className="font-mono">{countdown}</span>
      </p>

      <a
        href="https://chat.whatsapp.com/YOUR-GROUP-LINK-HERE"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-white text-purple-700 font-semibold px-5 py-2 rounded-md hover:bg-gray-100 transition duration-200"
      >
        Join WhatsApp Group
      </a>
    </div>
  );
}

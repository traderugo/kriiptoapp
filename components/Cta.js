import React from 'react';

const TelegramDMAccessBanner = () => {
  return (
    <div className="max-w-xl mx-auto p-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-lg text-center text-white mt-8">
      <h2 className="text-2xl font-bold mb-3">Want Access to Our Exclusive Signals?</h2>
      <p className="mb-4">
        Message me directly on Telegram to get instant access and start receiving top trading signals.
      </p>
      <a
        href="https://t.me/YOUR_TELEGRAM_USERNAME"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-white text-purple-700 font-semibold px-5 py-3 rounded-lg shadow hover:bg-gray-200 transition"
      >
        Message Me on Telegram
      </a>
    </div>
  );
};

export default TelegramDMAccessBanner;

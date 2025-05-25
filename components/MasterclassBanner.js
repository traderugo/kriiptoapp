// components/TelegramSubscribe.js

import React from 'react';

const TelegramSubscribe = () => {
  return (
    <div className="max-w-md mx-auto p-4 bg-gray-100 rounded-lg shadow-lg text-center">
      <h2 className="text-xl font-bold mb-2">Join Our Free Channel</h2>
      <p className="text-gray-700 mb-4">
        Get daily market insights, free trading signals, and exclusive content by joining our Telegram channel!
      </p>
      <a
        href="https://t.me/YOUR_TELEGRAM_CHANNEL_LINK"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition duration-300"
      >
        Subscribe Now
      </a>
    </div>
  );
};

export default TelegramSubscribe;

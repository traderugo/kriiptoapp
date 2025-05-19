// components/WhatsAppLink.js
import React from 'react';

const WhatsAppLink = ({ phoneNumber, message = '', children }) => {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-green-600 hover:underline"
    >
      {children || 'Chat on WhatsApp'}
    </a>
  );
};

export default WhatsAppLink;
// This component creates a WhatsApp link that opens a chat with the specified phone number and pre-fills a message.
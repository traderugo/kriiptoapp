// components/StickyShareBar.js
import { FaXTwitter, FaFacebookF } from 'react-icons/fa6';

export default function StickyShareBar({ url, message }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedMessage = encodeURIComponent(message);

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-md z-50 p-3 flex flex-col md:flex-row items-center justify-between gap-3 px-6">
      <span className="text-sm text-gray-700 text-center md:text-left">
        ⚡ Find this calculator helpful? Share it:
      </span>

      <div className="flex items-center gap-3">
        <a
          href={`https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 bg-black text-white text-sm px-4 py-2 rounded hover:opacity-80"
        >
          <FaXTwitter /> Share on X
        </a>

        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 bg-blue-600 text-white text-sm px-4 py-2 rounded hover:opacity-80"
        >
          <FaFacebookF /> Facebook
        </a>
      </div>
      <span>Made with&nbsp;❤️&nbsp; by</span>
  <a
    href="https://twitter.com/trader_ugo"
    target="_blank"
    rel="noopener noreferrer"
    className="font-semibold text-blue-600 hover:underline"
  >
    Trader Ugo
  </a>
    </div>
  );
}

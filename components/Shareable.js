import { Facebook, Twitter } from 'lucide-react'

export default function ShareButtons({ title, url }) {
  const shareUrl = encodeURIComponent(url)
  const shareText = encodeURIComponent(title)

  return (
    <div className="mt-8 p-4 bg-white rounded-2xl shadow-md">
      <p className="text-lg font-semibold mb-4 text-gray-800">
        Find this tool helpful? Don’t forget to share ↓
      </p>

<div className="flex flex-wrap items-center justify-center gap-4">
        <a
          href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition"
        >
          <Twitter size={20} className="text-white" />
          Share on X
        </a>

        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          <Facebook size={20} className="text-white" />
          Share on Facebook
        </a>
      </div>
    </div>
  )
}

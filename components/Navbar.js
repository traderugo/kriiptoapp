import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="bg-white  p-4 flex justify-between sticky top-0 z-50 shadow">
      <div className="font-bold"><Link href="/">
  <Image src="/logo.png" alt="Logo" width={150} height={150} />
</Link></div>
      <div className="space-x-4 bg-indigo-500 text-white p-2 rounded">
        <Link href="/home">Home 📡</Link>
      </div>
    </nav>
  );
}

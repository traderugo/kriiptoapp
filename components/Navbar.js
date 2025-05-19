import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between sticky top-0 z-50 shadow">
      <div className="font-bold">Krypto Kave</div>
      <div className="space-x-4 bg-white text-blue-600 p-2 rounded">
        <Link href="/admin">Home</Link>
      </div>
    </nav>
  );
}

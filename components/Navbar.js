import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between sticky top-0 z-50 shadow">
      <div className="font-bold"><Link href="/">
  <Image src="/logo.png" alt="Logo" width={40} height={40} />
</Link></div>
      <div className="space-x-4 bg-white text-blue-600 p-2 rounded">
        <Link href="/home">Signals</Link>
      </div>
    </nav>
  );
}

// components/Header.js
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-white shadow p-4 flex justify-between items-center">
      <Link href="/">
        <h1 className="text-xl font-bold text-purple-700">Vee</h1>
      </Link>
      <nav className="space-x-4">
        <Link href="/chat" className="text-gray-700 hover:text-purple-700">Report</Link>
        <Link href="/resources" className="text-gray-700 hover:text-purple-700">Resources</Link>
        <Link href="/community" className="text-gray-700 hover:text-purple-700">Community</Link>
      </nav>
    </header>
  );
}

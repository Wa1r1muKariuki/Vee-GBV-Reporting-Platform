// components/Footer.js
export default function Footer() {
  return (
    <footer className="w-full bg-white shadow-inner p-4 mt-6 text-center text-gray-600 text-sm">
      <p>© 2025 Vee. Your safety & anonymity come first.</p>
      <p>
        <a href="/privacy" className="underline">Privacy Policy</a> | 
        <a href="/transparency" className="underline ml-1">Transparency Statement</a>
      </p>
    </footer>
  );
}

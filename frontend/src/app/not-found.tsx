import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
          404
        </h1>
        <p className="text-gray-400 mb-8 text-lg">
          This page doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white hover:opacity-90 transition"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-5xl font-bold mb-4">Ultimate Streak</h1>
      <p className="text-xl text-gray-400 mb-8 text-center max-w-md">
        Pick real prediction market outcomes. Build your streak. Win the prize pool.
      </p>
      <div className="flex gap-4">
        <a
          href="/login"
          className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          Get Started
        </a>
        <a
          href="/leaderboard"
          className="border border-gray-700 hover:border-gray-500 text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          Leaderboard
        </a>
      </div>
    </main>
  );
}

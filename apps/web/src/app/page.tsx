import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 bg-white">
      <div className="text-center max-w-2xl">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 border border-brand-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          Live Now
        </div>

        <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-5 leading-[1.1] text-gray-900">
          Predict.{" "}
          <span className="text-brand-600">Streak.</span>{" "}
          Win.
        </h1>

        <p className="text-lg text-gray-500 mb-10 max-w-md mx-auto leading-relaxed">
          Pick real prediction market outcomes. Build the longest streak.
          Take home the prize pool.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/login" className="btn-primary text-base px-8 py-3">
            Get Started
          </Link>
          <Link href="/leaderboard" className="btn-secondary text-base px-8 py-3">
            View Leaderboard
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-sm mx-auto">
          <div>
            <p className="text-2xl font-bold text-gray-900">$10</p>
            <p className="text-xs text-gray-400 mt-1">Entry Fee</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-600">1</p>
            <p className="text-xs text-gray-400 mt-1">Pick / Day</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">100%</p>
            <p className="text-xs text-gray-400 mt-1">Prize Pool</p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="card p-5">
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-lg mb-3 border border-brand-100">
              1
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Join a Contest</h3>
            <p className="text-sm text-gray-500">
              Pay the entry fee to join the monthly contest and start competing.
            </p>
          </div>
          <div className="card p-5">
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-lg mb-3 border border-brand-100">
              2
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Make Your Pick</h3>
            <p className="text-sm text-gray-500">
              Choose Yes or No on real Kalshi prediction markets resolving today.
            </p>
          </div>
          <div className="card p-5">
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-lg mb-3 border border-brand-100">
              3
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Build Your Streak</h3>
            <p className="text-sm text-gray-500">
              Get it right and your streak grows. Longest streak wins the pool.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

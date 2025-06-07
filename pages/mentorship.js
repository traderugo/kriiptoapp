export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Master Futures Trading
          </h1>
          <p className="text-lg sm:text-xl mb-6">
            Join our structured mentorship to become a consistent and confident trader.
          </p>
          <a
            href="/enrollments"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded text-lg transition"
          >
            Enroll Now
          </a>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold mb-8 text-center">📚 Course Modules</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: '1. Intro to Crypto',
                desc: 'Understand how cryptocurrencies work, wallets, exchanges, and the crypto market structure.',
              },
              {
                title: '2. Intro to Technical Analysis',
                desc: 'Learn support/resistance, chart patterns, candlesticks, and indicators.',
              },
              {
                title: '3. SMC / ICT Concepts',
                desc: 'Dive into Smart Money Concepts and Inner Circle Trader strategies used by institutional traders.',
              },
              {
                title: '4. Risk Management',
                desc: 'Protect your capital with position sizing, stop-loss strategy, and risk-reward planning.',
              },
              {
                title: '5. Trading Psychology',
                desc: 'Build discipline, control emotions, and develop a sniper mindset in the markets.',
              },
            ].map((course) => (
              <div
                key={course.title}
                className="bg-white p-6 rounded-xl shadow border hover:shadow-lg transition"
              >
                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600">{course.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-6 border-t mt-10">
        &copy; {new Date().getFullYear()} Your Trading Academy. All rights reserved.
      </footer>
    </div>
  );
}

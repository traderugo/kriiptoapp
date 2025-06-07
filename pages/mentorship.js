import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Ugo’s Crypto Futures Mentorship</title>
        <meta name="description" content="Master crypto futures trading with Ugo's mentorship courses. Trade smarter, profit harder." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-white text-gray-900 font-sans">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center px-6 py-20 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            Unlock the Secrets of Crypto Futures Trading
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-10">
            Join my mentorship program and gain the edge you need to dominate the crypto futures market — no fluff, just proven tactics.
          </p>
          <a
            href="#pricing"
            className="bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold py-4 px-10 rounded-lg hover:from-green-500 hover:to-blue-600 transition"
          >
            Enroll Now
          </a>
        </section>

        {/* Features Section */}
        <section className="bg-gray-100 py-16 px-6 max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">What You’ll Get</h2>
          <div className="grid md:grid-cols-3 gap-10 text-center">
            <FeatureCard
              title="Live Trading Sessions"
              description="Watch me trade live and learn exactly how I analyze charts, manage risk, and execute."
              emoji="📈"
            />
            <FeatureCard
              title="Personalized Feedback"
              description="Get detailed critiques on your trades and direct mentorship to sharpen your skills."
              emoji="🧠"
            />
            <FeatureCard
              title="Proven Strategies"
              description="Access battle-tested setups, liquidity concepts, and market structure techniques that actually work."
              emoji="⚡"
            />
          </div>
        </section>

        {/* Mentor Bio */}
        <section className="py-20 px-6 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Meet Ugo</h2>
          <p className="text-gray-700 max-w-xl mx-auto mb-8">
            Crypto Futures trader turned mentor. I've walked through the wild jungle of markets, from brutal losses to calculated wins.
            Now, I’m here to guide you with a sniper’s precision, blending traditional wisdom with cutting-edge tactics.
          </p>
          <img
            src="/ugo-mentor.jpg"
            alt="Ugo Mentor"
            className="w-48 h-48 rounded-full mx-auto object-cover border-4 border-green-400"
          />
        </section>

        {/* Testimonials */}
        <section className="bg-gray-100 py-16 px-6 max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">What My Students Say</h2>
          <div className="space-y-10 md:grid md:grid-cols-3 md:gap-8 md:space-y-0">
            <Testimonial
              name="Sarah T."
              quote="Ugo’s mentorship changed how I approach trades. I went from random guessing to consistently profitable moves."
            />
            <Testimonial
              name="James K."
              quote="The live sessions alone are worth every penny. Real-time feedback that’s brutally honest but super helpful."
            />
            <Testimonial
              name="Leah M."
              quote="If you want to skip the rookie mistakes and fast-track your journey, this is it."
            />
          </div>
        </section>

        {/* Pricing + CTA */}
        <section
          id="pricing"
          className="py-20 px-6 max-w-4xl mx-auto text-center bg-gradient-to-r from-green-400 to-blue-500 rounded-lg shadow-lg text-white"
        >
          <h2 className="text-4xl font-extrabold mb-6">
            Ready to Level Up Your Trading?
          </h2>
          <p className="text-lg mb-10 max-w-xl mx-auto">
            Choose your plan and start your journey to becoming a crypto futures sniper.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-8">
            <PricingCard
              title="Basic"
              price="$299"
              features={[
                "Access to recorded sessions",
                "Community chat access",
                "Monthly Q&A"
              ]}
            />
            <PricingCard
              title="Pro"
              price="$699"
              features={[
                "Live trading sessions",
                "Personalized trade feedback",
                "Weekly strategy updates",
                "Private mentorship group"
              ]}
              popular
            />
          </div>

          <a
            href="mailto:ugo@cryptomentor.com?subject=Enroll%20in%20Crypto%20Futures%20Mentorship"
            className="mt-12 inline-block bg-white text-green-600 font-bold py-4 px-12 rounded-lg hover:bg-gray-100 transition"
          >
            Get Started Now
          </a>
        </section>

        <footer className="py-8 text-center text-gray-500 text-sm bg-gray-50 mt-20">
          © {new Date().getFullYear()} Ugo’s Crypto Futures Mentorship. All rights reserved.
        </footer>
      </main>
    </>
  );
}

function FeatureCard({ title, description, emoji }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition">
      <div className="text-5xl mb-4">{emoji}</div>
      <h3 className="text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  );
}

function Testimonial({ name, quote }) {
  return (
    <blockquote className="bg-white p-6 rounded-lg shadow-md text-gray-800 italic">
      “{quote}”
      <footer className="mt-4 text-right font-bold text-green-600">— {name}</footer>
    </blockquote>
  );
}

function PricingCard({ title, price, features, popular }) {
  return (
    <div
      className={`flex flex-col bg-white text-gray-900 rounded-lg shadow-lg p-8 max-w-sm mx-auto ${
        popular ? 'border-4 border-green-500 scale-105' : ''
      }`}
    >
      <h3 className="text-3xl font-extrabold mb-4">{title}</h3>
      <p className="text-4xl font-bold mb-6">{price}</p>
      <ul className="flex-grow mb-6 space-y-3 text-left">
        {features.map((feat, i) => (
          <li key={i} className="before:content-['✓'] before:text-green-500 before:mr-2">
            {feat}
          </li>
        ))}
      </ul>
    
    </div>
  );
}

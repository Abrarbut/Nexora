import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
          The Future of
          <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Multi-Vendor Shopping
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          Discover products from top vendors, powered by AI search,
          personalized recommendations, and a seamless shopping experience.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-xl bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
          >
            Start Shopping
          </Link>
          <Link
            href="/vendor/apply"
            className="rounded-xl border border-slate-600 px-8 py-3 text-lg font-semibold text-slate-300 transition hover:border-slate-400 hover:text-white"
          >
            Become a Vendor
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "AI-Powered Search",
              desc: "Find exactly what you need with natural language search powered by GPT-4o.",
              icon: "🔍",
            },
            {
              title: "Multi-Vendor Marketplace",
              desc: "Shop from hundreds of verified vendors in one unified experience.",
              icon: "🏪",
            },
            {
              title: "Smart Recommendations",
              desc: "Get personalized product suggestions based on your browsing history.",
              icon: "✨",
            },
            {
              title: "Secure Payments",
              desc: "Pay safely with Stripe. Your money is protected with every purchase.",
              icon: "🔒",
            },
            {
              title: "Vendor Dashboard",
              desc: "Vendors get powerful tools to manage products, orders, and earnings.",
              icon: "📊",
            },
            {
              title: "Review Insights",
              desc: "AI sentiment analysis helps you make informed purchasing decisions.",
              icon: "💬",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm transition hover:border-slate-600"
            >
              <div className="text-3xl">{feature.icon}</div>
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-8 text-center text-sm text-slate-500">
        <p>&copy; 2026 Nexora. Built with Next.js, Prisma, Stripe &amp; OpenAI.</p>
      </footer>
    </main>
  );
}

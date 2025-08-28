import { useRouter } from 'next/navigation';
import './globals.css'

export default function Home() {
  const router = useRouter()
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-20">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 py-12 mb-8">
        <h1 className="font-[var(--font-space-grotesk)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-[#39FF14] to-[#00ff99] bg-clip-text text-transparent mb-6">
          Welcome To RippleBids Marketplace
        </h1>

        <p className="text-base sm:text-lg lg:text-xl mb-8 max-w-2xl text-gray-300">
          Join the future of <span className="text-[#39FF14]">decentralized commerce</span> on XRP Ledger, EVM chains, and Solana
        </p>

        <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
          <button className="btn-neon px-6 md:px-8 py-3 text-base lg:text-lg w-full sm:w-auto" onClick={() => {router.push("/wallet")}}>
            🔌 Connect Wallet
          </button>
          <button className="px-6 md:px-8 py-3 text-base lg:text-lg border border-[#39FF14] rounded-full hover:bg-[#39FF14]/10 transition-all w-full sm:w-auto" onClick={() => router.push("/marketplace")}>
            🌐 Join Marketplace
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="feature-card glass-effect">
            <div className="text-[#39FF14] text-4xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold mb-4">Lightning Fast</h3>
            <p className="text-gray-400">Experience instant transactions across multiple blockchains with cutting-edge technology.</p>
          </div>

          <div className="feature-card glass-effect">
            <div className="text-[#39FF14] text-4xl mb-4">🛡️</div>
            <h3 className="text-2xl font-bold mb-4">Secure & Trusted</h3>
            <p className="text-gray-400">Built with enterprise-grade security and audited smart contracts for maximum protection.</p>
          </div>

          <div className="feature-card glass-effect">
            <div className="text-[#39FF14] text-4xl mb-4">🌐</div>
            <h3 className="text-2xl font-bold mb-4">Multi-Chain</h3>
            <p className="text-gray-400">Seamlessly interact across XRP Ledger, EVM chains, and Solana ecosystems.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-[#111111]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { title: "Connect Wallet", icon: "👛" },
              { title: "Choose Listing", icon: "🖼️" },
              { title: "Place Bid", icon: "💰" },
              { title: "Buy Asset", icon: "✨" }
            ].map((step, index) => (
              <div key={index} className="text-center p-4 hover:bg-[#1a1a1a] rounded-xl transition-all">
                <div className="text-4xl mb-3">{step.icon}</div>
                <h3 className="text-lg lg:text-xl font-bold">{step.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">About RippleBids</h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            RippleBids is more than just a marketplace—it’s a new era of decentralized commerce. 
            By integrating XRP Ledger’s speed, EVM’s flexibility, and Solana’s scalability, 
            RippleBids empowers users to access the best of all ecosystems in one unified platform. 
            Whether you’re bidding on NFTs, trading tokens, or exchanging assets, RippleBids ensures 
            transparency, efficiency, and trust at every step.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <button className="btn-neon px-8 py-3 text-lg">
            Register Now
          </button>
        </div>
      </section>
    </main>
  );
}

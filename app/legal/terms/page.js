export default function TermsPage() {
    const sections = [
      ["Acceptance of Terms", "By using RippleBids, you agree to comply with and be legally bound by these Terms and all applicable laws and regulations. If you do not agree, do not use our services."],
      ["Eligibility", "To use RippleBids, you must:", ["Be at least 18 years old", "Be legally capable of entering a binding contract", "Not be barred from using our services under applicable law"]],
      ["Account Registration", "To access certain features, you must register for an account. You agree to:", ["Provide accurate and complete information", "Keep your login credentials secure", "Be responsible for all activity under your account"]],
      ["Marketplace Services", "RippleBids provides tools to:", ["Buy and sell goods or services", "Participate in auctions", "Create and customize online storefronts"], "We are not a party to any transaction between buyers and sellers. We only provide the platform."],
      ["Fees & Payment", "Transaction fees start at 3.5% and may decrease to 1.5% based on performance or volume tiers. All transactions are powered by the XRP Ledger (XRPL). You are responsible for any third-party transaction fees (e.g., gas fees, wallet transfers)."],
      ["Use of the XRP Ledger", "By transacting on RippleBids, you understand and accept that:", ["All payments are processed on-chain", "Transactions are irreversible once validated", "You are responsible for ensuring the correct wallet addresses and amounts"]],
      // ... Add remaining sections in the same structure
    ]
  
    return (
      <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-[#111111] mt-10">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-12 text-white">RippleBids Terms of Service</h1>
  
          {/* Sections Container */}
          <div className="space-y-6">
            {sections.map(([title, text, list, extra], idx) => (
              <div
                key={idx}
                className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 transition-all hover:border-purple-500 hover:shadow-lg"
              >
                <h2 className="text-2xl font-bold mb-4 text-white">{idx + 1}. {title}</h2>
                <p className="text-gray-300 mb-3">{text}</p>
                {list && (
                  <ul className="list-disc list-inside text-gray-300 space-y-2 mb-3 pl-4">
                    {list.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                )}
                {extra && <p className="text-gray-300">{extra}</p>}
              </div>
            ))}
  
            {/* Contact Section */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 transition-all hover:border-purple-500 hover:shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-white">Contact Us</h2>
              <p className="text-gray-300 mb-3">For any questions about these Terms, reach out to:</p>
              <div className="space-y-2">
                <p className="text-gray-300">
                  <strong className="text-purple-400">Email:</strong>{" "}
                  <a href="mailto:support@ripplebids.com" className="text-blue-400 hover:text-blue-300">support@ripplebids.com</a>
                </p>
                <p className="text-gray-300">
                  <strong className="text-purple-400">Website:</strong>{" "}
                  <a href="https://www.ripplebids.com" className="text-blue-400 hover:text-blue-300">www.ripplebids.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
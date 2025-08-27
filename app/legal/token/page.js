"use client"
import Image from "next/image"

export default function TokenAllocationPage() {
  const tables = [
    {
      title: "XRPB EVM TOKEN CATEGORIES",
      data: [
        ["DEX/Pre-Sale", "20%", "600,000,000.00", "Tokens available for public buying/selling"],
        ["Community", "15%", "450,000,000.00", "Giveaways, rewards, events, etc."],
        ["Marketing/Development", "11.67%", "350,010,000.00", "Platform development & marketing"],
        ["Burn", "11.83%", "354,990,000.00", "Allocated for deflationary burns"],
        ["Locked Liquidity", "10.67%", "300,000,000.00", "Locked, not usable"],
        ["Vested Liquidity", "2.67%", "80,010,000.00", "Vested, temporarily unusable"],
        ["Treasury", "1.67%", "50,010,000.00", "Reserve account"],
        ["Payroll", "1.67%", "50,010,000.00", "Staff Bonus"],
        ["Grants", "1.67%", "50,010,000.00", "Allocated for developer grants"],
        ["Board Holdings - CEO", "8.33%", "249,900,000.00", ""],
        ["Board Holdings - CFO", "5.5%", "165,000,000.00", ""],
        ["Board Holdings - COO", "5.5%", "165,000,000.00", ""],
        ["Board Holdings - CMO", "5.5%", "165,000,000.00", ""],
      ],
      total: ["100%", "3,029,940,000.00"]
    },
    {
      title: "XRPBL TOKEN CATEGORIES",
      data: [
        ["Public Ecosystem", "90%", "90,000,000.00", "Tokens available for public buying/selling"],
        ["Company Holdings", "10%", "10,000,000.00", "Breakdown of company allocation below"],
        ["Development & Marketing", "25%", "2,500,000.00", "Allocation of tokens for development & marketing platform"],
        ["Locked Liquidity", "20%", "2,000,000.00", "Liquidity locked for trust and set the floor for minimum liquidity"],
        ["Board Allocation", "20%", "2,000,000.00", "Token Allocation for board members"],
        ["Payroll", "10%", "1,000,000.00", "Payroll Allocation"],
        ["Miscellaneous", "10%", "1,000,000.00", "Can be used for various business/platform needs"],
        ["Loans/Grants", "10%", "1,000,000.00", "Lending of tokens or grants for community"],
        ["Reserve", "5%", "500,000.00", "Tokens Reserved for emergency use"],
      ],
      total: ["100%", "100,000,000.00"]
    },
    {
      title: "XRPB-SOL TOKEN CATEGORIES",
      data: [
        ["Public Ecosystem", "94.23%", "942,210,000.00", "Public tokens available for purchase"],
        ["Company Holdings", "5.72%", "57,220,000.00", "Breakdown of company allocation below"],
        ["Locked Wallet", "68.14%", "39,000,000.00", "Locked Liquidity wallet"],
        ["Development & Marketing", "9.71%", "5,555,000.00", "Allocation of tokens for developing & marketing platform"],
        ["Board Allocation", "3.50%", "3,644,000.00", "Token Allocation for board members"],
        ["Payroll", "3.18%", "1,822,000.00", "Payroll Allocation"],
        ["Miscellaneous", "3.18%", "1,822,000.00", "Can be used for various business/platform needs"],
        ["Loans/Grants", "3.18%", "1,822,000.00", "Lending of tokens or grants for community"],
        ["Reserve", "2.87%", "1,644,000.00", "Tokens Reserved for emergency use"],
      ],
      total: ["100%", "999,939,600.00"]
    },
  ]

  return (
    <div className="min-h-screen bg-[#111111] py-16 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Token Allocations Overview</h1>

        {/* Token Tables */}
        {tables.map((table, idx) => (
          <div key={idx} className="bg-[#1a1a1a]/60 backdrop-blur-md border border-gray-800 rounded-2xl p-6 shadow-lg space-y-4 hover:border-purple-500 transition-all">
            <h2 className="text-2xl font-bold text-purple-400 mb-4">{table.title}</h2>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="px-4 py-2 text-green-400">Category</th>
                    <th className="px-4 py-2 text-green-400">% Allocation</th>
                    <th className="px-4 py-2 text-green-400">Tokens</th>
                    <th className="px-4 py-2 text-green-400">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {table.data.map((row, i) => (
                    <tr key={i} className="border-b border-gray-700 hover:bg-[#2a1a3a]/20 transition-colors">
                      {row.map((cell, j) => (
                        <td key={j} className="px-4 py-2 text-gray-300">{cell}</td>
                      ))}
                    </tr>
                  ))}
                  <tr className="font-bold text-white bg-green-500/20">
                    <td className="px-4 py-2">Totals:</td>
                    <td className="px-4 py-2">{table.total[0]}</td>
                    <td className="px-4 py-2">{table.total[1]}</td>
                    <td className="px-4 py-2">{table.title.includes("XRPBL") ? "90% public ecosystem, 10% company holdings" : ""}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Ohio Certificate */}
<div className="bg-[#1a1a1a]/60 backdrop-blur-md border border-gray-800 rounded-2xl p-6 shadow-lg flex flex-col items-center space-y-6 max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold text-purple-400 text-center">Ohio Certificate of Registration</h2>

  <p className="text-gray-300 text-center">
    Proof of licensing and registration for Ohio operations.
  </p>

  <div className="relative w-full h-80 md:h-96 rounded-xl border border-gray-700 overflow-hidden">
    <Image
      src="https://res.cloudinary.com/dlbbjwcwh/image/upload/v1756311965/RippleBids_Image_wkuiq0.jpg"
      alt="Ohio Certificate"
      fill
      style={{ objectFit: "contain" }}
    />
  </div>
</div>

      </div>
    </div>
  )
}

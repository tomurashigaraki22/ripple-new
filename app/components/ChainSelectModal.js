import Dialog from "./ui/dialog"
import { Button } from "./ui/button"
import { Coins, Wallet, Bitcoin } from "lucide-react"

export default function ChainSelectModal({ open, onClose, onSelect }) {
  return (
    <Dialog open={open} onClose={onClose}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Choose Payment Network</h2>
        <p className="text-gray-400 text-sm">
          Select your preferred blockchain to complete the subscription.
        </p>
      </div>

      {/* Options */}
      <div className="mt-6 space-y-4">
        {/* XRPL */}
        <Button
          className="w-full flex items-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white py-4 rounded-xl text-lg shadow-md"
          onClick={() => { onSelect("xrpl"); onClose() }}
        >
          <Coins className="w-5 h-5" />
          XRPL (XRPB)
        </Button>

        {/* Ethereum */}
        <Button
          className="w-full flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 text-white py-4 rounded-xl text-lg shadow-md"
          onClick={() => { onSelect("ethereum"); onClose() }}
        >
          <Wallet className="w-5 h-5" />
          Ethereum
        </Button>

        {/* Bitcoin */}
        <Button
          className="w-full flex items-center gap-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90 text-white py-4 rounded-xl text-lg shadow-md"
          onClick={() => { onSelect("btc"); onClose() }}
        >
          <Bitcoin className="w-5 h-5" />
          Bitcoin
        </Button>
      </div>
    </Dialog>
  )
}

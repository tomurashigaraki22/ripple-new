// lib/btcPaymentHelper.js
import QRCode from "qrcode"

// Config for BTC networks
const BTC_NETWORKS = {
  mainnet: {
    api: "https://blockstream.info/api",
    explorer: "https://blockstream.info/tx/",
  },
  testnet: {
    api: "https://blockstream.info/testnet/api",
    explorer: "https://blockstream.info/testnet/tx/",
  },
}

// ✅ Generate QR code for BTC payment
export async function generateBTCQRCode(address, amountBTC) {
  const uri = `bitcoin:${address}?amount=${amountBTC}`
  return await QRCode.toDataURL(uri)
}

// ✅ Poll BTC blockchain for transaction confirmation
export async function monitorBTCPayment(network, address, expectedAmount, timeout = 600000, interval = 15000) {
  const end = Date.now() + timeout
  const api = BTC_NETWORKS[network]?.api || BTC_NETWORKS.mainnet.api

  while (Date.now() < end) {
    try {
      const res = await fetch(`${api}/address/${address}/utxo`)
      const utxos = await res.json()

      const match = utxos.find(u => u.value >= expectedAmount * 1e8) // satoshis

      if (match && match.status?.confirmed) {
        return { success: true, txid: match.txid }
      }
    } catch (err) {
      console.error("BTC monitor error:", err)
    }

    await new Promise(r => setTimeout(r, interval))
  }

  return { success: false, error: "Timeout: Payment not detected" }
}

export function getBTCExplorerUrl(network, txid) {
  return `${BTC_NETWORKS[network]?.explorer || BTC_NETWORKS.mainnet.explorer}${txid}`
}

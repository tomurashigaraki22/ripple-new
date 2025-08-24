export function MarketplaceStats({ totalListings, filteredCount }) {
    return (
      <div className="bg-[#111111] border-b border-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Marketplace</h1>
              <p className="text-gray-400">
                Showing {filteredCount} of {totalListings} items
              </p>
            </div>
  
            <div className="flex space-x-6 text-sm">
              <div className="text-center">
                <div className="text-green-400 font-bold text-lg">{totalListings}</div>
                <div className="text-gray-400">Total Items</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-bold text-lg">24/7</div>
                <div className="text-gray-400">Active</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-bold text-lg">Multi-Chain</div>
                <div className="text-gray-400">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
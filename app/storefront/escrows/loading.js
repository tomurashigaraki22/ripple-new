import StorefrontSidebar from "../../components/StoreFrontSidebar"

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <div className="flex">
        <StorefrontSidebar />

        <main className="flex-1 ml-64 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-96 mb-8"></div>

            <div className="flex gap-4 mb-6">
              <div className="h-10 bg-gray-700 rounded flex-1"></div>
              <div className="h-10 bg-gray-700 rounded w-48"></div>
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-800/30 rounded-lg p-6">
                  <div className="h-6 bg-gray-700 rounded w-48 mb-4"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-4 bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

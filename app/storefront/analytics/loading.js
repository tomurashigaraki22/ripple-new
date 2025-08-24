import StorefrontSidebar from "../../components/StoreFrontSidebar"

export default function AnalyticsLoading() {
  return (
    <div className="flex min-h-screen bg-[#1a1a1a]">
      <StorefrontSidebar />

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-800 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-800 rounded w-64"></div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 sm:p-6">
                <div className="h-4 bg-gray-800 rounded w-24 mb-4"></div>
                <div className="h-8 bg-gray-800 rounded w-16"></div>
              </div>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="h-64 sm:h-80 lg:h-96 bg-gray-800 rounded"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                  <div className="h-64 bg-gray-800 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

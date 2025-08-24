export default function Loading() {
    return (
      <div className="w-full max-w-3xl mx-auto p-6 space-y-6 animate-pulse">
        {/* Title */}
        <div className="h-7 w-48 bg-gray-800 rounded-md" />
  
        {/* Profile Picture */}
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 rounded-full bg-gray-800" />
          <div className="h-4 w-40 bg-gray-800 rounded-md" />
        </div>
  
        {/* Username */}
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-800 rounded-md" />
          <div className="h-10 w-full bg-gray-800 rounded-lg" />
        </div>
  
        {/* Wallet Addresses */}
        <div className="space-y-4">
          <div className="h-5 w-40 bg-gray-800 rounded-md" />
  
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-32 bg-gray-800 rounded-md" />
              <div className="h-10 w-full bg-gray-800 rounded-lg" />
            </div>
          ))}
        </div>
  
        {/* Save Button */}
        <div className="h-10 w-36 bg-gray-800 rounded-lg" />
      </div>
    )
  }
  
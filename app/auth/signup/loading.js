export default function SignUpLoading() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-20 px-4">
      <div className="max-w-md mx-auto glass-effect rounded-2xl p-8 mt-8">
        <div className="animate-pulse space-y-6">
          {/* Title Skeleton */}
          <div className="h-8 bg-[#1a1a1a] rounded-lg w-3/4 mx-auto"></div>
          
          {/* Form Fields Skeleton */}
          <div className="space-y-4">
            <div className="h-4 bg-[#1a1a1a] rounded w-1/4"></div>
            <div className="h-12 bg-[#1a1a1a] rounded-lg"></div>
          </div>
          
          <div className="space-y-4">
            <div className="h-4 bg-[#1a1a1a] rounded w-1/4"></div>
            <div className="h-12 bg-[#1a1a1a] rounded-lg"></div>
          </div>
          
          <div className="space-y-4">
            <div className="h-4 bg-[#1a1a1a] rounded w-1/4"></div>
            <div className="h-12 bg-[#1a1a1a] rounded-lg"></div>
          </div>
          
          {/* Button Skeleton */}
          <div className="h-12 bg-[#1a1a1a] rounded-lg w-full"></div>
        </div>
      </div>
    </main>
  );
}
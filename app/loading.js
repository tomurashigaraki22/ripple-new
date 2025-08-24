export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#39FF14] mb-4"></div>
        <p className="text-[#39FF14] text-lg font-[var(--font-space-grotesk)]">Loading...</p>
      </div>
    </div>
  );
}
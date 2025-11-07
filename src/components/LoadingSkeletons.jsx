import React from 'react';

// Skeleton shimmer animation component
export const SkeletonShimmer = ({ className = "" }) => (
  <div className={`relative overflow-hidden bg-gray-700/30 rounded-lg ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"></div>
  </div>
);

// Stats Card Skeleton
export const StatsCardSkeleton = () => (
  <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border-2 border-gray-700/40 shadow-[0_0_20px_rgba(34,211,238,0.1)] animate-pulse">
    <div className="flex items-center justify-between mb-2">
      <SkeletonShimmer className="h-4 w-24" />
      <SkeletonShimmer className="h-5 w-5 rounded-full" />
    </div>
    <SkeletonShimmer className="h-8 w-32 mb-2" />
    <SkeletonShimmer className="h-3 w-20" />
  </div>
);

// Dual Yield Flow Skeleton
export const DualYieldFlowSkeleton = () => (
  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border-2 border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.2)] p-6 animate-pulse">
    <div className="flex items-center justify-between mb-6">
      <SkeletonShimmer className="h-8 w-48" />
    </div>

    <SkeletonShimmer className="h-6 w-full mb-8" />

    <div className="space-y-8">
      {/* Source */}
      <div className="flex items-center justify-center">
        <SkeletonShimmer className="h-32 w-64 rounded-2xl" />
      </div>

      {/* Split Arrow */}
      <div className="flex items-center justify-center">
        <SkeletonShimmer className="h-16 w-24 rounded-lg" />
      </div>

      {/* Yield Streams */}
      <div className="grid md:grid-cols-2 gap-6">
        <SkeletonShimmer className="h-80 rounded-2xl" />
        <SkeletonShimmer className="h-80 rounded-2xl" />
      </div>

      {/* Key Innovation */}
      <SkeletonShimmer className="h-32 rounded-2xl" />
    </div>
  </div>
);

// Public Goods Tracker Skeleton
export const PublicGoodsTrackerSkeleton = () => (
  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.3)] p-6 border-2 border-purple-500/30 animate-pulse">
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        <SkeletonShimmer className="w-12 h-12 rounded-xl" />
        <div className="space-y-2">
          <SkeletonShimmer className="h-6 w-48" />
          <SkeletonShimmer className="h-4 w-32" />
        </div>
      </div>
      <SkeletonShimmer className="w-10 h-10 rounded-lg" />
    </div>

    {/* Main Stat */}
    <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl p-6 mb-6 border-2 border-purple-500/40">
      <SkeletonShimmer className="h-6 w-56 mb-4" />
      <SkeletonShimmer className="h-12 w-40 mb-2" />
      <SkeletonShimmer className="h-4 w-32" />
    </div>

    {/* Impact Metrics Grid */}
    <div className="grid grid-cols-2 gap-4 mb-6">
      <SkeletonShimmer className="h-32 rounded-xl" />
      <SkeletonShimmer className="h-32 rounded-xl" />
    </div>

    {/* How it Works */}
    <SkeletonShimmer className="h-48 rounded-xl" />
  </div>
);

// Harvest Button Skeleton
export const HarvestButtonSkeleton = () => (
  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border-2 border-yellow-500/30 shadow-[0_0_25px_rgba(234,179,8,0.2)] animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <SkeletonShimmer className="w-12 h-12 rounded-xl" />
        <div className="space-y-2">
          <SkeletonShimmer className="h-6 w-32" />
          <SkeletonShimmer className="h-4 w-48" />
        </div>
      </div>
    </div>

    <SkeletonShimmer className="h-12 w-full rounded-lg" />
  </div>
);

// Community Borrower Dashboard Skeleton
export const CommunityBorrowerSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header Card */}
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border-2 border-blue-500/30">
      <SkeletonShimmer className="h-8 w-64 mb-4" />
      <SkeletonShimmer className="h-6 w-full mb-2" />
      <SkeletonShimmer className="h-6 w-3/4" />
    </div>

    {/* Stats Grid */}
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <SkeletonShimmer className="h-32 rounded-xl" />
      <SkeletonShimmer className="h-32 rounded-xl" />
      <SkeletonShimmer className="h-32 rounded-xl" />
    </div>

    {/* Benefits Card */}
    <SkeletonShimmer className="h-64 rounded-xl" />
  </div>
);

// Mini Loading Spinner for inline use
export const LoadingSpinner = ({ size = "md", color = "cyan" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  const colorClasses = {
    cyan: "border-cyan-400 border-t-transparent",
    purple: "border-purple-400 border-t-transparent",
    green: "border-green-400 border-t-transparent",
    pink: "border-pink-400 border-t-transparent"
  };

  return (
    <div className={`${sizeClasses[size]} border-2 ${colorClasses[color]} rounded-full animate-spin`}></div>
  );
};

// Full Page Loading State
export const FullPageLoader = ({ message = "Loading..." }) => (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
    <div className="text-center">
      <div className="relative w-24 h-24 mx-auto mb-6">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"></div>
        {/* Spinning ring */}
        <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 border-r-purple-400 rounded-full animate-spin"></div>
        {/* Inner glow */}
        <div className="absolute inset-4 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-xl"></div>
      </div>
      <p className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent uppercase tracking-wider">
        {message}
      </p>
      <p className="text-sm text-gray-500 mt-2">Please wait...</p>
    </div>
  </div>
);

// Data Loading Placeholder (when data is being fetched but UI exists)
export const DataLoadingPlaceholder = ({ text = "Loading data..." }) => (
  <div className="flex items-center justify-center space-x-3 py-8">
    <LoadingSpinner size="md" color="cyan" />
    <span className="text-gray-400 font-medium">{text}</span>
  </div>
);

// Transaction Processing Overlay
export const TransactionProcessing = ({ message = "Processing transaction...", txHash = null }) => (
  <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 border-2 border-cyan-500/30 shadow-[0_0_40px_rgba(34,211,238,0.3)] max-w-md">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 border-r-purple-400 rounded-full animate-spin"></div>
          <div className="absolute inset-2 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-full blur-lg animate-pulse"></div>
        </div>

        <h3 className="text-xl font-bold text-cyan-400 uppercase tracking-wider mb-2">
          {message}
        </h3>

        {txHash && (
          <div className="mt-4 p-3 bg-gray-900/60 rounded-lg border border-cyan-500/30">
            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Transaction Hash:</p>
            <p className="text-xs font-mono text-cyan-400 break-all">{txHash}</p>
          </div>
        )}

        <p className="text-sm text-gray-400 mt-4">
          Do not close this window...
        </p>
      </div>
    </div>
  </div>
);

export default {
  SkeletonShimmer,
  StatsCardSkeleton,
  DualYieldFlowSkeleton,
  PublicGoodsTrackerSkeleton,
  HarvestButtonSkeleton,
  CommunityBorrowerSkeleton,
  LoadingSpinner,
  FullPageLoader,
  DataLoadingPlaceholder,
  TransactionProcessing
};

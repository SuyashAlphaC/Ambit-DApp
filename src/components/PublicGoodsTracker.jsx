import React from 'react';
import { Gift, TrendingUp, Heart, Sparkles } from 'lucide-react';

const PublicGoodsTracker = ({ totalDonated, borrowerCount, healthFactor }) => {
  const formatNumber = (num) => {
    const n = parseFloat(num);
    if (isNaN(n)) return '0.00';
    if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(2) + 'K';
    return n.toFixed(2);
  };

  // Estimate daily donation rate (simplified calculation)
  const estimateDailyDonation = () => {
    const donated = parseFloat(totalDonated);
    if (donated === 0) return '0.00';
    // Rough estimate: assume donations accumulated over some time period
    return (donated / 30).toFixed(4); // Assuming 30 days as example
  };

  return (
    <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-xl shadow-xl p-6 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Gift className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Public Goods Impact</h3>
            <p className="text-sm opacity-90">Funding Octant via Morpho interest</p>
          </div>
        </div>

        {/* Main Stat */}
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/30">
          <div className="flex items-center space-x-3 mb-3">
            <Sparkles className="w-6 h-6 text-yellow-300" />
            <p className="text-sm font-medium opacity-90">Total Donated to Public Goods</p>
          </div>
          <p className="text-5xl font-bold mb-2">{formatNumber(totalDonated)}</p>
          <p className="text-2xl font-medium opacity-90">DAI</p>

          <div className="mt-4 pt-4 border-t border-white/30">
            <div className="flex items-center justify-between text-sm">
              <span className="opacity-75">Estimated Daily Rate:</span>
              <span className="font-bold">{estimateDailyDonation()} DAI/day</span>
            </div>
          </div>
        </div>

        {/* Impact Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="w-4 h-4 text-pink-300" />
              <p className="text-xs opacity-75">Community Impact</p>
            </div>
            <p className="text-2xl font-bold">{borrowerCount}</p>
            <p className="text-xs opacity-75">Active Borrowers</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-300" />
              <p className="text-xs opacity-75">System Health</p>
            </div>
            <p className="text-2xl font-bold">{healthFactor}</p>
            <p className="text-xs opacity-75">Health Factor</p>
          </div>
        </div>

        {/* How Donations Work */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
          <p className="font-bold text-sm mb-3 flex items-center space-x-2">
            <span>💡</span>
            <span>How Public Goods Funding Works</span>
          </p>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                1
              </div>
              <p className="opacity-90 text-xs">
                Community members borrow DAI and pay interest
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                2
              </div>
              <p className="opacity-90 text-xs">
                100% of lending interest is collected as "Secondary Yield"
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                3
              </div>
              <p className="opacity-90 text-xs">
                All interest is donated to Octant's dragonRouter for public goods
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-6 bg-gradient-to-r from-pink-500/30 to-purple-500/30 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <p className="text-sm font-bold mb-1">Continuous Public Goods Funding 🎯</p>
          <p className="text-xs opacity-90">
            Every second, this protocol generates yield that goes directly to funding Octant public goods
            while maintaining perfect 1:1 DAI peg for treasury depositors.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicGoodsTracker;

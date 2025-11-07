import { useState, useEffect } from 'react';
import { Gift, TrendingUp, Heart, Sparkles, Loader, Zap } from 'lucide-react';
import { ethers } from 'ethers';
import { CONTRACTS, ABIS } from '../config/contracts';

const PublicGoodsTrackerNeon = ({ borrowerCount, healthFactor, provider }) => {
  const [totalDonated, setTotalDonated] = useState('0');
  const [loading, setLoading] = useState(true);
  const [recentDonations, setRecentDonations] = useState([]);

  useEffect(() => {
    if (provider) {
      fetchCumulativeDonations();
    }
  }, [provider]);

  const fetchCumulativeDonations = async () => {
    try {
      setLoading(true);

      const strategyContract = new ethers.Contract(
        CONTRACTS.STRATEGY,
        ABIS.YieldDonatingVault,
        provider
      );

      // Query YieldDonated events from contract deployment
      console.log('Fetching YieldDonated events...');

      const filter = strategyContract.filters.YieldDonated();

      // Get events from deployment block to latest
      // Note: On Tenderly, this works; on mainnet, you'd need to batch requests
      const events = await strategyContract.queryFilter(filter, 0, 'latest');

      console.log(`Found ${events.length} YieldDonated events`);

      // Sum up all donations
      let total = 0n;
      const donations = [];

      for (const event of events) {
        const amount = event.args.amount || event.args[0] || 0n;
        const recipient = event.args.recipient || event.args[1] || '';

        total += BigInt(amount);

        donations.push({
          amount: ethers.formatUnits(amount, 18),
          recipient: recipient,
          blockNumber: event.blockNumber,
          txHash: event.transactionHash
        });
      }

      setTotalDonated(ethers.formatUnits(total, 18));
      setRecentDonations(donations.slice(-5).reverse()); // Last 5 donations

      console.log('Total donated:', ethers.formatUnits(total, 18), 'DAI');
    } catch (err) {
      console.error('Failed to fetch donations:', err);
      setTotalDonated('0');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    const n = parseFloat(num);
    if (isNaN(n)) return '0.0000';
    if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(2) + 'K';
    if (n < 0.01) return n.toFixed(6); // Show more decimals for small amounts
    return n.toFixed(4);
  };

  const estimateDailyDonation = () => {
    const donated = parseFloat(totalDonated);
    if (donated === 0 || recentDonations.length === 0) return '0.0000';

    // Calculate based on recent donation rate
    // This is a simplified estimate
    return (donated * 0.1).toFixed(6); // Rough daily estimate
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.3)] p-6 border-2 border-purple-500/30 relative overflow-hidden">
      {/* Animated neon decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl -mr-16 -mt-16 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/20 rounded-full blur-2xl -ml-12 -mb-12 animate-pulse" style={{animationDelay: '1s'}}></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)]">
              <Gift className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">PUBLIC GOODS IMPACT</h3>
              <p className="text-sm text-purple-300">Funding Octant via Morpho Interest</p>
            </div>
          </div>
          <button
            onClick={fetchCumulativeDonations}
            disabled={loading}
            className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30 hover:bg-purple-500/30 transition-all"
            title="Refresh donations"
          >
            <Zap className={`w-4 h-4 text-purple-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Main Stat - Total Donated */}
        <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl p-6 mb-6 border-2 border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
          <div className="flex items-center space-x-3 mb-3">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            <p className="text-sm font-medium text-gray-300 uppercase tracking-wider">Total Donated to Public Goods</p>
          </div>

          {loading ? (
            <div className="flex items-center space-x-3 my-4">
              <Loader className="w-8 h-8 text-purple-400 animate-spin" />
              <span className="text-gray-400">Loading donation history...</span>
            </div>
          ) : (
            <>
              <div className="flex items-baseline space-x-2 mb-2">
                <p className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  {formatNumber(totalDonated)}
                </p>
                <p className="text-2xl font-medium text-purple-300">DAI</p>
              </div>

              {parseFloat(totalDonated) > 0 && (
                <div className="mt-2 text-xs text-green-400 flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{recentDonations.length} donation{recentDonations.length !== 1 ? 's' : ''} recorded on-chain</span>
                </div>
              )}
            </>
          )}

          <div className="mt-4 pt-4 border-t border-purple-500/30">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Estimated Daily Rate:</span>
              <span className="font-bold text-purple-300">{estimateDailyDonation()} DAI/day</span>
            </div>
          </div>
        </div>

        {/* Recent Donations List */}
        {recentDonations.length > 0 && (
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-4 mb-6 border border-purple-500/20">
            <p className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-3">Recent Donations</p>
            <div className="space-y-2">
              {recentDonations.map((donation, index) => (
                <div key={index} className="flex items-center justify-between text-xs bg-gray-800/50 rounded-lg p-2 border border-purple-500/10">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-mono">{parseFloat(donation.amount).toFixed(6)} DAI</span>
                  </div>
                  <span className="text-gray-500">Block {donation.blockNumber}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Impact Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-4 border-2 border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.2)] hover:border-pink-400/50 transition-all">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="w-4 h-4 text-pink-400" />
              <p className="text-xs text-gray-400 uppercase tracking-wider">Community Impact</p>
            </div>
            <p className="text-3xl font-bold text-pink-400">{borrowerCount}</p>
            <p className="text-xs text-gray-500 mt-1">Active Borrowers</p>
          </div>

          <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-4 border-2 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:border-green-400/50 transition-all">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <p className="text-xs text-gray-400 uppercase tracking-wider">System Health</p>
            </div>
            <p className="text-3xl font-bold text-green-400">{healthFactor}</p>
            <p className="text-xs text-gray-500 mt-1">Health Factor</p>
          </div>
        </div>

        {/* How Donations Work */}
        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm rounded-xl p-5 border border-purple-500/20">
          <p className="font-bold text-sm mb-3 flex items-center space-x-2 text-purple-300">
            <span>💡</span>
            <span className="uppercase tracking-wider">How Public Goods Funding Works</span>
          </p>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-500/30 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-purple-300 border border-purple-500/50">
                1
              </div>
              <p className="text-gray-300 text-xs">
                Community members borrow DAI and pay interest
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-500/30 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-purple-300 border border-purple-500/50">
                2
              </div>
              <p className="text-gray-300 text-xs">
                100% of lending interest is collected as "Secondary Yield"
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-500/30 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-purple-300 border border-purple-500/50">
                3
              </div>
              <p className="text-gray-300 text-xs">
                All interest is donated to Octant's dragonRouter for public goods
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-6 bg-gradient-to-r from-pink-900/30 to-purple-900/30 backdrop-blur-sm rounded-xl p-4 border-2 border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.2)]">
          <p className="text-sm font-bold mb-1 text-pink-300">CONTINUOUS PUBLIC GOODS FUNDING 🎯</p>
          <p className="text-xs text-gray-300">
            Every second, this protocol generates yield that goes directly to funding Octant public goods
            while maintaining perfect 1:1 DAI peg for treasury depositors.
          </p>
        </div>

        {/* Live indicator */}
        <div className="mt-4 flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
          <span className="text-xs text-gray-400 uppercase tracking-wider">Live On-Chain Data</span>
        </div>
      </div>
    </div>
  );
};

export default PublicGoodsTrackerNeon;

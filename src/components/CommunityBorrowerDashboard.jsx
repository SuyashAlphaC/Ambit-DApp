import React, { useState, useEffect } from 'react';
import { Users, AlertCircle, CheckCircle } from 'lucide-react';
import { ethers } from 'ethers';
import CommunityBorrowingInterface from './CommunityBorrowingInterface';

const STRATEGY_ABI = [
  "function isCommunityBorrower(address borrower) external view returns (bool)",
  "function getBorrowerInfo(address borrower) external view returns (bool isWhitelisted, uint256 totalRepaid, uint256 currentDebt)"
];

const CommunityBorrowerDashboard = ({ account, provider, signer, strategyAddress }) => {
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [totalRepaid, setTotalRepaid] = useState('0');
  const [currentDebt, setCurrentDebt] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (account && provider && strategyAddress) {
      loadBorrowerData();
    }
  }, [account, provider, strategyAddress]);

  const loadBorrowerData = async () => {
    try {
      setLoading(true);
      const strategyContract = new ethers.Contract(strategyAddress, STRATEGY_ABI, provider);

      const borrowerInfo = await strategyContract.getBorrowerInfo(account);
      setIsWhitelisted(borrowerInfo.isWhitelisted);
      setTotalRepaid(ethers.formatUnits(borrowerInfo.totalRepaid, 18));
      setCurrentDebt(ethers.formatUnits(borrowerInfo.currentDebt, 18));
    } catch (err) {
      console.error('Error loading borrower data:', err);
      setError('Failed to load borrower information');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    const n = parseFloat(num);
    if (isNaN(n)) return '0.00';
    return n.toFixed(4);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border-2 border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.5)]">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Community Borrower Dashboard
              </h3>
              <p className="text-sm text-gray-400 uppercase tracking-wider">Track your auto-repaying loan</p>
            </div>
          </div>

          {/* Whitelist Status */}
          <div className={`rounded-xl p-4 border-2 ${
            isWhitelisted
              ? 'bg-green-900/20 border-green-500/40 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
              : 'bg-gray-900/40 border-gray-600/40'
          }`}>
            <div className="flex items-center space-x-3">
              {isWhitelisted ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div className="flex-1">
                    <p className="font-bold text-green-300 uppercase tracking-wider">You are Whitelisted!</p>
                    <p className="text-sm text-gray-300">You can borrow from the community lending pool</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-6 h-6 text-gray-500" />
                  <div className="flex-1">
                    <p className="font-bold text-gray-300 uppercase tracking-wider">Not Whitelisted</p>
                    <p className="text-sm text-gray-400">Contact DAO management to get whitelisted</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-12 border-2 border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.2)]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 border-r-purple-400 rounded-full animate-spin"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-full blur-lg animate-pulse"></div>
            </div>
            <p className="text-sm text-gray-400 uppercase tracking-wider">Loading borrower data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Program Stats - Always Show */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border-2 border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.2)]">
            <p className="text-sm font-bold text-purple-300 mb-4 uppercase tracking-wider">Community Lending Program</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/60 rounded-xl p-4 border border-purple-500/30">
                <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Total Borrowers</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {account ? '0' : '-'}
                </p>
              </div>
              <div className="bg-gray-900/60 rounded-xl p-4 border border-purple-500/30">
                <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Total Repaid</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  0.0000 DAI
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4 italic">
              DSR yield from treasury automatically repays community loans
            </p>
          </div>

          {/* Main Content */}
          {isWhitelisted ? (
            <CommunityBorrowingInterface
              account={account}
              provider={provider}
              signer={signer}
              onBorrowSuccess={loadBorrowerData}
            />
          ) : (
            <div className="space-y-6">
              {/* Benefits Card */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border-2 border-green-500/30 shadow-[0_0_25px_rgba(34,197,94,0.2)]">
                <p className="text-lg font-bold text-green-300 mb-4 uppercase tracking-wider">
                  Benefits of Auto-Repaying Loans
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">
                      <span className="font-bold text-green-400">Zero Manual Repayments:</span> Loans auto-repay from DAO treasury DSR yield
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">
                      <span className="font-bold text-cyan-400">DAO Subsidized:</span> Community members get interest-free loans
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">
                      <span className="font-bold text-purple-400">Financial Inclusion:</span> Access to capital without credit checks
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">
                      <span className="font-bold text-pink-400">Transparent:</span> All repayments visible on blockchain
                    </span>
                  </li>
                </ul>
              </div>

              {/* How to Get Whitelisted */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border-2 border-blue-500/30 shadow-[0_0_25px_rgba(59,130,246,0.2)]">
                <p className="text-lg font-bold text-blue-300 mb-4 uppercase tracking-wider">
                  How to Get Whitelisted
                </p>
                <ol className="space-y-3 list-decimal list-inside">
                  <li className="text-sm text-gray-300">
                    <span className="font-bold text-blue-400">Submit Application:</span> Contact DAO management with your community profile
                  </li>
                  <li className="text-sm text-gray-300">
                    <span className="font-bold text-cyan-400">DAO Vote:</span> Community votes on whitelist applications
                  </li>
                  <li className="text-sm text-gray-300">
                    <span className="font-bold text-purple-400">Get Approved:</span> Once approved, you can borrow with auto-repayment
                  </li>
                </ol>
                <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                  <p className="text-xs text-blue-300 font-bold uppercase tracking-wider mb-2">
                    Your Address:
                  </p>
                  <p className="text-xs text-gray-300 font-mono break-all">
                    {account || 'Not connected'}
                  </p>
                </div>
              </div>

              {/* Example Scenario */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border-2 border-yellow-500/30 shadow-[0_0_25px_rgba(234,179,8,0.2)]">
                <p className="text-lg font-bold text-yellow-300 mb-4 uppercase tracking-wider">
                  Example: How It Works
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-3 border-b border-yellow-500/30">
                    <span className="text-gray-400">You borrow:</span>
                    <span className="font-bold text-yellow-400">1,000 DAI</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-yellow-500/30">
                    <span className="text-gray-400">DAO treasury DSR yield:</span>
                    <span className="font-bold text-green-400">~5% APY</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-yellow-500/30">
                    <span className="text-gray-400">Monthly auto-repayment:</span>
                    <span className="font-bold text-cyan-400">~4.17 DAI</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-gray-400">Loan fully repaid in:</span>
                    <span className="font-bold text-purple-400">~20 months</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4 italic">
                  * Actual repayment depends on DAO treasury size and DSR rates
                </p>
              </div>
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={loadBorrowerData}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-bold hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(168,85,247,0.3)] uppercase tracking-wider border-2 border-purple-400/30"
          >
            {loading ? 'REFRESHING...' : 'REFRESH DATA'}
          </button>
        </>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 backdrop-blur-xl border-2 border-red-500/40 rounded-xl p-4 flex items-start space-x-3 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-300 uppercase tracking-wider">Error</p>
            <p className="text-sm text-red-200">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityBorrowerDashboard;

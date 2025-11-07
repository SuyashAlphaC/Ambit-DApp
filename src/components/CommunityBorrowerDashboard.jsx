import React, { useState, useEffect } from 'react';
import { Users, TrendingDown, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { ethers } from 'ethers';

const STRATEGY_ABI = [
  "function isCommunityBorrower(address borrower) external view returns (bool)",
  "function getBorrowerInfo(address borrower) external view returns (bool isWhitelisted, uint256 totalRepaid, uint256 currentDebt)"
];

const MORPHO_ABI = [
  "function borrow(tuple(address loanToken, address collateralToken, address oracle, address irm, uint256 lltv) marketParams, uint256 assets, uint256 shares, address onBehalf, address receiver) external returns (uint256, uint256)",
  "function supply(tuple(address loanToken, address collateralToken, address oracle, address irm, uint256 lltv) marketParams, uint256 assets, uint256 shares, address onBehalf, bytes data) external returns (uint256, uint256)",
  "function supplyCollateral(tuple(address loanToken, address collateralToken, address oracle, address irm, uint256 lltv) marketParams, uint256 assets, address onBehalf, bytes data) external"
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

  const repaymentProgress = () => {
    const debt = parseFloat(currentDebt);
    const repaid = parseFloat(totalRepaid);
    if (debt === 0 && repaid === 0) return 0;
    const total = debt + repaid;
    return ((repaid / total) * 100).toFixed(1);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Community Borrower Dashboard</h3>
          <p className="text-xs text-gray-500">Track your auto-repaying loan</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-4">Loading borrower data...</p>
        </div>
      ) : (
        <>
          {/* Whitelist Status */}
          <div className={`rounded-xl p-4 mb-6 ${
            isWhitelisted
              ? 'bg-green-50 border-2 border-green-200'
              : 'bg-gray-50 border-2 border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              {isWhitelisted ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div className="flex-1">
                    <p className="font-bold text-green-900">You are Whitelisted!</p>
                    <p className="text-sm text-green-700">You can borrow from the community lending pool</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-6 h-6 text-gray-500" />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">Not Whitelisted</p>
                    <p className="text-sm text-gray-600">Contact DAO management to get whitelisted</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Program Stats - Always Show */}
          <div className="mb-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-200">
            <p className="text-sm font-bold text-purple-900 mb-3">Community Lending Program</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-purple-700 mb-1">Total Borrowers</p>
                <p className="text-xl font-bold text-purple-900">{account ? '0' : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-purple-700 mb-1">Total Repaid</p>
                <p className="text-xl font-bold text-purple-900">0.0000 DAI</p>
              </div>
            </div>
            <p className="text-xs text-purple-600 mt-3 italic">
              DSR yield from treasury automatically repays community loans
            </p>
          </div>

          {isWhitelisted && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border border-red-200">
                  <p className="text-xs font-medium text-red-700 mb-1">Current Debt</p>
                  <p className="text-2xl font-bold text-red-900">{formatNumber(currentDebt)}</p>
                  <p className="text-xs text-red-600">DAI borrowed</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <p className="text-xs font-medium text-green-700 mb-1">Auto-Repaid</p>
                  <p className="text-2xl font-bold text-green-900">{formatNumber(totalRepaid)}</p>
                  <p className="text-xs text-green-600">DAI from DSR yield</p>
                </div>
              </div>

              {/* Repayment Progress */}
              {(parseFloat(currentDebt) > 0 || parseFloat(totalRepaid) > 0) && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Auto-Repayment Progress</p>
                    <p className="text-sm font-bold text-indigo-600">{repaymentProgress()}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${repaymentProgress()}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    DSR yield automatically reduces your debt over time
                  </p>
                </div>
              )}

              {/* How Auto-Repayment Works */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-200">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-indigo-900 mb-2">How Auto-Repayment Works</p>
                    <ul className="text-xs text-indigo-700 space-y-1.5">
                      <li>• DAO treasury deposits DAI → earns DSR through sDAI</li>
                      <li>• DSR yield is used to repay YOUR loan automatically</li>
                      <li>• You only pay interest, which funds public goods</li>
                      <li>• Your principal gradually decreases without you doing anything</li>
                      <li>• This is a subsidized loan from the DAO to the community</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Borrowing Info */}
              {parseFloat(currentDebt) === 0 && (
                <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-2">Ready to Borrow?</p>
                  <p className="text-xs text-blue-700 mb-3">
                    To borrow DAI from the community pool:
                  </p>
                  <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Supply collateral (sDAI) to Morpho Blue</li>
                    <li>Borrow DAI against your collateral</li>
                    <li>Your debt will auto-repay via DSR subsidies</li>
                  </ol>
                  <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                    <p className="text-xs text-blue-900">
                      <span className="font-bold">Note:</span> You need to interact directly with Morpho Blue
                      to supply collateral and borrow. This dashboard only shows your repayment progress.
                    </p>
                  </div>
                </div>
              )}

              {/* Active Loan Info */}
              {parseFloat(currentDebt) > 0 && (
                <div className="mt-6 bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-start space-x-3">
                    <TrendingDown className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-amber-900 mb-1">Active Loan Status</p>
                      <p className="text-xs text-amber-700">
                        Your loan is being automatically repaid with DSR yield from the DAO treasury.
                        Check back regularly to see your debt decrease!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Info for Non-Whitelisted Users */}
          {!isWhitelisted && (
            <div className="space-y-4">
              {/* Benefits Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                <p className="text-sm font-bold text-green-900 mb-3">Benefits of Auto-Repaying Loans</p>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-green-800">
                      <span className="font-semibold">Zero Manual Repayments:</span> Loans auto-repay from DAO treasury DSR yield
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-green-800">
                      <span className="font-semibold">DAO Subsidized:</span> Community members get interest-free loans
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-green-800">
                      <span className="font-semibold">Promotes Financial Inclusion:</span> Access to capital without credit checks
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-green-800">
                      <span className="font-semibold">Transparent & On-Chain:</span> All repayments visible on blockchain
                    </span>
                  </li>
                </ul>
              </div>

              {/* How to Get Whitelisted */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                <p className="text-sm font-bold text-blue-900 mb-3">How to Get Whitelisted</p>
                <ol className="space-y-2 list-decimal list-inside">
                  <li className="text-xs text-blue-800">
                    <span className="font-semibold">Submit Application:</span> Contact DAO management with your community profile
                  </li>
                  <li className="text-xs text-blue-800">
                    <span className="font-semibold">DAO Vote:</span> Community votes on whitelist applications
                  </li>
                  <li className="text-xs text-blue-800">
                    <span className="font-semibold">Get Approved:</span> Once approved, you can borrow with auto-repayment
                  </li>
                </ol>
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-xs text-blue-900">
                    <span className="font-bold">Your Address:</span>
                  </p>
                  <p className="text-xs text-blue-700 font-mono mt-1 break-all">
                    {account || 'Not connected'}
                  </p>
                </div>
              </div>

              {/* Example Scenario */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
                <p className="text-sm font-bold text-amber-900 mb-3">Example: How It Works</p>
                <div className="space-y-2 text-xs text-amber-800">
                  <div className="flex justify-between py-2 border-b border-amber-200">
                    <span>You borrow:</span>
                    <span className="font-bold">1,000 DAI</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-amber-200">
                    <span>DAO treasury DSR yield:</span>
                    <span className="font-bold">~5% APY</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-amber-200">
                    <span>Monthly auto-repayment:</span>
                    <span className="font-bold">~4.17 DAI</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Loan fully repaid in:</span>
                    <span className="font-bold">~20 months</span>
                  </div>
                </div>
                <p className="text-xs text-amber-700 mt-3 italic">
                  * Actual repayment depends on DAO treasury size and DSR rates
                </p>
              </div>
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={loadBorrowerData}
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 text-sm"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default CommunityBorrowerDashboard;

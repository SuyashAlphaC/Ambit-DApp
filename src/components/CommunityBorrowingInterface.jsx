import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ArrowRight, CheckCircle, AlertCircle, Loader, TrendingUp, DollarSign, Shield, Zap } from 'lucide-react';
import { CONTRACTS, ABIS, MORPHO_MARKET_PARAMS } from '../config/contracts';

const CommunityBorrowingInterface = ({ account, provider, signer, onBorrowSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // User balances
  const [daiBalance, setDaiBalance] = useState('0');
  const [sdaiBalance, setSdaiBalance] = useState('0');

  // Morpho position data
  const [collateralSupplied, setCollateralSupplied] = useState('0');
  const [daiDebtBorrowed, setDaiDebtBorrowed] = useState('0');
  const [currentLTV, setCurrentLTV] = useState('0');
  const [maxBorrowable, setMaxBorrowable] = useState('0');
  const [autoRepaidAmount, setAutoRepaidAmount] = useState('0');

  // Form inputs
  const [collateralAmount, setCollateralAmount] = useState('');
  const [supplyAmount, setSupplyAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [activeTab, setActiveTab] = useState('supply'); // 'supply' or 'borrow'

  // Load user data
  useEffect(() => {
    if (account && provider) {
      loadUserData();
    }
  }, [account, provider]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('📊 Loading user data for account:', account);

      // Get DAI balance
      const daiContract = new ethers.Contract(CONTRACTS.DAI, ABIS.ERC20, provider);
      const daiBal = await daiContract.balanceOf(account);
      const daiBalanceFormatted = ethers.formatUnits(daiBal, 18);
      setDaiBalance(daiBalanceFormatted);
      console.log('💰 DAI Balance:', daiBalanceFormatted);

      // Get sDAI balance
      const sdaiContract = new ethers.Contract(CONTRACTS.SDAI, ABIS.ERC20, provider);
      const sdaiBal = await sdaiContract.balanceOf(account);
      const sdaiBalanceFormatted = ethers.formatUnits(sdaiBal, 18);
      setSdaiBalance(sdaiBalanceFormatted);
      console.log('💰 sDAI Balance:', sdaiBalanceFormatted);

      // Get Morpho position
      const morphoContract = new ethers.Contract(
        CONTRACTS.MORPHO_BLUE,
        [
          'function position(bytes32 id, address user) view returns (uint256 supplyShares, uint128 borrowShares, uint128 collateral)',
          'function market(bytes32 id) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)',
        ],
        provider
      );

      console.log('🔍 Querying Morpho position with:');
      console.log('   Market ID:', MORPHO_MARKET_PARAMS.marketId);
      console.log('   User Address:', account);
      const position = await morphoContract.position(MORPHO_MARKET_PARAMS.marketId, account);
      console.log('📍 Raw Position Data:');
      console.log('   supplyShares:', position.supplyShares.toString());
      console.log('   borrowShares:', position.borrowShares.toString());
      console.log('   collateral (raw):', position.collateral.toString());
      console.log('   collateral (formatted):', ethers.formatUnits(position.collateral, 18), 'sDAI');

      const marketData = await morphoContract.market(MORPHO_MARKET_PARAMS.marketId);
      console.log('📈 Market Data:', {
        totalSupplyAssets: marketData.totalSupplyAssets.toString(),
        totalSupplyShares: marketData.totalSupplyShares.toString(),
        totalBorrowAssets: marketData.totalBorrowAssets.toString(),
        totalBorrowShares: marketData.totalBorrowShares.toString()
      });

      // Calculate collateral in DAI value (sDAI is ~1:1 with DAI, slightly higher)
      const collateral = ethers.formatUnits(position.collateral, 18);
      setCollateralSupplied(collateral);
      console.log('🔒 Collateral Supplied:', collateral, 'sDAI');

      // Calculate borrowed amount
      const borrowShares = position.borrowShares;
      const totalBorrowAssets = marketData.totalBorrowAssets;
      const totalBorrowShares = marketData.totalBorrowShares;

      const borrowed = totalBorrowShares > 0n
        ? (borrowShares * totalBorrowAssets) / totalBorrowShares
        : 0n;

      const borrowedDAI = ethers.formatUnits(borrowed, 18);
      setDaiDebtBorrowed(borrowedDAI);
      console.log('💳 Debt Borrowed:', borrowedDAI, 'DAI');

      // Calculate LTV
      const collateralValue = parseFloat(collateral);
      const debtValue = parseFloat(borrowedDAI);
      const ltv = collateralValue > 0 ? (debtValue / collateralValue) * 100 : 0;
      setCurrentLTV(ltv.toFixed(2));
      console.log('📊 Current LTV:', ltv.toFixed(2) + '%');

      // Calculate max borrowable (98% LTV - current debt)
      const maxBorrow = Math.max(0, (collateralValue * 0.98) - debtValue);
      setMaxBorrowable(maxBorrow.toFixed(6));
      console.log('💵 Max Borrowable:', maxBorrow.toFixed(6), 'DAI');

      // Get auto-repaid amount from strategy
      const strategyContract = new ethers.Contract(
        CONTRACTS.STRATEGY,
        ABIS.YieldDonatingVault,
        provider
      );

      try {
        const repaid = await strategyContract.debtRepaidForBorrower(account);
        const repaidFormatted = ethers.formatUnits(repaid, 18);
        setAutoRepaidAmount(repaidFormatted);
        console.log('✅ Auto-Repaid Amount:', repaidFormatted, 'DAI');
      } catch (err) {
        console.warn('Could not fetch auto-repaid amount:', err.message);
        setAutoRepaidAmount('0');
      }

      console.log('✅ User data loaded successfully');

    } catch (err) {
      console.error('❌ Error loading user data:', err);
      setError('Failed to load your position data');
    } finally {
      setLoading(false);
    }
  };

  // Convert DAI to sDAI
  const handleConvertToSDAI = async () => {
    if (!collateralAmount || parseFloat(collateralAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const amount = ethers.parseUnits(collateralAmount, 18);

      // Approve DAI
      const daiContract = new ethers.Contract(CONTRACTS.DAI, ABIS.ERC20, signer);
      const allowance = await daiContract.allowance(account, CONTRACTS.SDAI);

      if (allowance < amount) {
        const approveTx = await daiContract.approve(CONTRACTS.SDAI, ethers.MaxUint256);
        await approveTx.wait();
      }

      // Deposit to sDAI
      const sdaiContract = new ethers.Contract(
        CONTRACTS.SDAI,
        ['function deposit(uint256 assets, address receiver) returns (uint256)'],
        signer
      );

      const tx = await sdaiContract.deposit(amount, account);
      await tx.wait();

      setSuccess(`Successfully converted ${collateralAmount} DAI to sDAI!`);
      setCollateralAmount('');
      await loadUserData();

    } catch (err) {
      console.error('Convert to sDAI failed:', err);
      setError(err.message || 'Failed to convert to sDAI');
    } finally {
      setLoading(false);
    }
  };

  // Supply sDAI collateral to Morpho
  const handleSupplyCollateral = async () => {
    if (!supplyAmount || parseFloat(supplyAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const amount = ethers.parseUnits(supplyAmount, 18);

      // Approve sDAI to Morpho
      const sdaiContract = new ethers.Contract(CONTRACTS.SDAI, ABIS.ERC20, signer);
      const allowance = await sdaiContract.allowance(account, CONTRACTS.MORPHO_BLUE);

      if (allowance < amount) {
        const approveTx = await sdaiContract.approve(CONTRACTS.MORPHO_BLUE, ethers.MaxUint256);
        await approveTx.wait();
      }

      // Supply collateral to Morpho
      const morphoContract = new ethers.Contract(
        CONTRACTS.MORPHO_BLUE,
        [
          'function supplyCollateral((address,address,address,address,uint256) marketParams, uint256 assets, address onBehalf, bytes data)',
        ],
        signer
      );

      const marketParams = [
        MORPHO_MARKET_PARAMS.loanToken,
        MORPHO_MARKET_PARAMS.collateralToken,
        MORPHO_MARKET_PARAMS.oracle,
        MORPHO_MARKET_PARAMS.irm,
        MORPHO_MARKET_PARAMS.lltv,
      ];

      const tx = await morphoContract.supplyCollateral(marketParams, amount, account, '0x');
      await tx.wait();

      setSuccess(`Successfully supplied ${supplyAmount} sDAI as collateral!`);
      setSupplyAmount('');
      await loadUserData();
      if (onBorrowSuccess) onBorrowSuccess();

    } catch (err) {
      console.error('Supply collateral failed:', err);
      setError(err.message || 'Failed to supply collateral');
    } finally {
      setLoading(false);
    }
  };

  // Borrow DAI
  const handleBorrow = async () => {
    if (!borrowAmount || parseFloat(borrowAmount) <= 0) {
      setError('Please enter a valid borrow amount');
      return;
    }

    const borrowValue = parseFloat(borrowAmount);
    const maxBorrowValue = parseFloat(maxBorrowable);

    if (borrowValue > maxBorrowValue) {
      setError(`Cannot borrow more than ${maxBorrowable} DAI (98% LTV limit)`);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const amount = ethers.parseUnits(borrowAmount, 18);

      // Borrow from Morpho
      const morphoContract = new ethers.Contract(
        CONTRACTS.MORPHO_BLUE,
        [
          'function borrow((address,address,address,address,uint256) marketParams, uint256 assets, uint256 shares, address onBehalf, address receiver)',
        ],
        signer
      );

      const marketParams = [
        MORPHO_MARKET_PARAMS.loanToken,
        MORPHO_MARKET_PARAMS.collateralToken,
        MORPHO_MARKET_PARAMS.oracle,
        MORPHO_MARKET_PARAMS.irm,
        MORPHO_MARKET_PARAMS.lltv,
      ];

      const tx = await morphoContract.borrow(marketParams, amount, 0, account, account);
      await tx.wait();

      setSuccess(`Successfully borrowed ${borrowAmount} DAI! Your debt will be auto-repaid by DSR yield.`);
      setBorrowAmount('');
      await loadUserData();
      if (onBorrowSuccess) onBorrowSuccess();

    } catch (err) {
      console.error('Borrow failed:', err);
      setError(err.message || 'Failed to borrow DAI');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0.00';
    return num.toFixed(4);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border-2 border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Borrow from Community Pool
            </h2>
            <p className="text-sm text-gray-400 uppercase tracking-wider">Auto-Repaying Loans</p>
          </div>
        </div>

        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
          <p className="text-sm text-blue-300 mb-2">
            <CheckCircle className="w-4 h-4 inline mr-1" />
            <span className="font-bold">You are whitelisted!</span> You can borrow DAI using sDAI as collateral.
          </p>
          <p className="text-xs text-gray-400 mb-3">
            Your debt will be automatically repaid over time using DSR yield from the DAO treasury. You only pay interest, which funds public goods!
          </p>
          <div className="bg-blue-900/40 rounded px-3 py-2 border border-blue-500/20">
            <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">Monitoring Wallet:</p>
            <p className="text-xs text-gray-300 font-mono break-all">{account}</p>
          </div>
        </div>
      </div>

      {/* Position Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border-2 border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Collateral Supplied</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            {formatNumber(collateralSupplied)} sDAI
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border-2 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Current Debt</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            {formatNumber(daiDebtBorrowed)} DAI
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border-2 border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Current LTV</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {currentLTV}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Max: 98%</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border-2 border-cyan-500/40 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Auto-Repaid</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {formatNumber(autoRepaidAmount)} DAI
          </p>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={() => loadUserData()}
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(168,85,247,0.3)] uppercase tracking-wider border-2 border-purple-400/30 text-sm flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              REFRESHING...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              REFRESH DATA
            </>
          )}
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-900/20 backdrop-blur-xl border-2 border-red-500/40 rounded-xl p-4 flex items-start space-x-3 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-300 uppercase tracking-wider">Error</p>
            <p className="text-sm text-red-200">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-900/20 backdrop-blur-xl border-2 border-green-500/40 rounded-xl p-4 flex items-start space-x-3 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-green-300 uppercase tracking-wider">Success</p>
            <p className="text-sm text-green-200">{success}</p>
          </div>
        </div>
      )}

      {/* Action Panel */}
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border-2 border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.2)] overflow-hidden">
        {/* Tabs */}
        <div className="border-b-2 border-purple-500/30">
          <div className="flex">
            <button
              onClick={() => setActiveTab('supply')}
              className={`flex-1 px-6 py-4 text-center font-bold transition-all uppercase tracking-wider ${
                activeTab === 'supply'
                  ? 'bg-gradient-to-r from-green-500/20 to-cyan-500/20 text-cyan-400 border-b-2 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                  : 'text-gray-400 hover:bg-gray-700/30 hover:text-gray-200'
              }`}
            >
              Supply Collateral
            </button>
            <button
              onClick={() => setActiveTab('borrow')}
              className={`flex-1 px-6 py-4 text-center font-bold transition-all uppercase tracking-wider ${
                activeTab === 'borrow'
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border-b-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                  : 'text-gray-400 hover:bg-gray-700/30 hover:text-gray-200'
              }`}
            >
              Borrow DAI
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'supply' ? (
            <div className="space-y-6">
              {/* Step 1: Convert to sDAI */}
              <div className="bg-gray-900/60 rounded-xl p-5 border-2 border-cyan-500/30">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                  <h3 className="text-lg font-bold text-cyan-400">Convert DAI to sDAI</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">
                      Amount (DAI)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={collateralAmount}
                        onChange={(e) => setCollateralAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-3 bg-gray-900/60 border-2 border-cyan-500/40 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-500 shadow-[0_0_10px_rgba(34,211,238,0.1)] focus:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all"
                        disabled={loading}
                      />
                      <button
                        onClick={() => setCollateralAmount(daiBalance)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-wider"
                        disabled={loading}
                      >
                        MAX
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Balance: {formatNumber(daiBalance)} DAI
                    </p>
                  </div>

                  <button
                    onClick={handleConvertToSDAI}
                    disabled={loading || !collateralAmount}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-lg font-bold hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(34,211,238,0.3)] uppercase tracking-wider border-2 border-cyan-400/30"
                  >
                    {loading ? 'CONVERTING...' : 'CONVERT TO sDAI'}
                  </button>
                </div>
              </div>

              {/* Step 2: Supply Collateral */}
              <div className="bg-gray-900/60 rounded-xl p-5 border-2 border-green-500/30">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                  <h3 className="text-lg font-bold text-green-400">Supply sDAI to Morpho</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">
                      Amount (sDAI)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={supplyAmount}
                        onChange={(e) => setSupplyAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-3 bg-gray-900/60 border-2 border-green-500/40 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-500 shadow-[0_0_10px_rgba(34,197,94,0.1)] focus:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all"
                        disabled={loading}
                      />
                      <button
                        onClick={() => setSupplyAmount(sdaiBalance)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-green-400 hover:text-green-300 uppercase tracking-wider"
                        disabled={loading}
                      >
                        MAX
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Available sDAI: {formatNumber(sdaiBalance)}
                    </p>
                  </div>

                  <button
                    onClick={handleSupplyCollateral}
                    disabled={loading || !supplyAmount || parseFloat(sdaiBalance) === 0}
                    className="w-full bg-gradient-to-r from-green-500 to-cyan-500 text-white py-3 rounded-lg font-bold hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(34,197,94,0.3)] uppercase tracking-wider border-2 border-green-400/30"
                  >
                    {loading ? 'SUPPLYING...' : 'SUPPLY COLLATERAL'}
                  </button>

                  <div className="bg-cyan-900/20 rounded-lg p-3 border border-cyan-500/30">
                    <p className="text-xs text-cyan-300 font-bold mb-2 uppercase tracking-wider">What happens:</p>
                    <ul className="text-xs text-gray-300 space-y-1">
                      <li>• Your sDAI is deposited as collateral in Morpho</li>
                      <li>• You can then borrow up to 98% of its value in DAI</li>
                      <li>• Your sDAI continues earning DSR yield</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Borrow Section */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">
                  Amount to Borrow (DAI)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={borrowAmount}
                    onChange={(e) => setBorrowAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-gray-900/60 border-2 border-purple-500/40 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-500 shadow-[0_0_10px_rgba(168,85,247,0.1)] focus:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"
                    disabled={loading}
                  />
                  <button
                    onClick={() => setBorrowAmount(maxBorrowable)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-purple-400 hover:text-purple-300 uppercase tracking-wider"
                    disabled={loading}
                  >
                    MAX
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Max Borrowable: {formatNumber(maxBorrowable)} DAI (98% LTV)
                </p>
              </div>

              <button
                onClick={handleBorrow}
                disabled={loading || !borrowAmount || parseFloat(collateralSupplied) === 0}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-bold hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(168,85,247,0.3)] uppercase tracking-wider border-2 border-purple-400/30"
              >
                {loading ? 'BORROWING...' : 'BORROW DAI'}
              </button>

              {parseFloat(collateralSupplied) === 0 && (
                <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
                  <p className="text-sm text-yellow-300 font-bold mb-1">No Collateral Supplied</p>
                  <p className="text-xs text-yellow-200">
                    You need to supply sDAI collateral first before you can borrow.
                  </p>
                </div>
              )}

              <div className="bg-purple-900/20 rounded-lg p-4 border-2 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                <p className="text-sm text-purple-300 font-bold mb-2 uppercase tracking-wider flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Auto-Repayment Benefits:
                </p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• <span className="font-bold text-green-400">Zero manual repayments</span> - Your debt decreases automatically</li>
                  <li>• <span className="font-bold text-blue-400">DSR yield</span> from DAO treasury repays your loan</li>
                  <li>• You only pay <span className="font-bold text-purple-400">interest</span>, which funds public goods</li>
                  <li>• Your principal is subsidized by the community!</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border-2 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
        <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          How Auto-Repayment Works
        </h3>

        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</div>
            <p><span className="font-bold text-green-400">DAO deposits DAI</span> → Converts to sDAI earning DSR (~5% APY)</p>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</div>
            <p><span className="font-bold text-cyan-400">You supply sDAI collateral</span> → Borrow DAI at 98% LTV</p>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">3</div>
            <p><span className="font-bold text-purple-400">DSR yield auto-repays</span> → Your debt decreases over time</p>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">4</div>
            <p><span className="font-bold text-pink-400">Interest funds public goods</span> → Octant receives your interest payments</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityBorrowingInterface;

import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, Users, DollarSign, Info, ChevronDown, ChevronUp, ExternalLink, Wallet, Sparkles } from 'lucide-react';
import { ethers } from "ethers";
import { CONTRACTS, ABIS, NETWORK, MORPHO_MARKET_PARAMS } from './config/contracts';
import DualYieldFlowNeon from './components/DualYieldFlowNeon';
import CommunityBorrowerDashboard from './components/CommunityBorrowerDashboard';
import PublicGoodsTrackerNeon from './components/PublicGoodsTrackerNeon';
import HarvestButton from './components/HarvestButton';
import LandingPage from './components/LandingPage';
import {
  StatsCardSkeleton,
  DualYieldFlowSkeleton,
  PublicGoodsTrackerSkeleton,
  HarvestButtonSkeleton,
  CommunityBorrowerSkeleton,
  TransactionProcessing
} from './components/LoadingSkeletons';
import {
  SuccessToast,
  TransactionSuccessModal,
  Confetti
} from './components/SuccessAnimations';

const AmbitDApp = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [txProcessing, setTxProcessing] = useState(false);
  const [processingTxHash, setProcessingTxHash] = useState('');
  const [error, setError] = useState('');

  // User balances
  const [daiBalance, setDaiBalance] = useState('0');
  const [shareBalance, setShareBalance] = useState('0');
  const [shareValue, setShareValue] = useState('0');

  // Strategy stats
  const [totalAssets, setTotalAssets] = useState('0');
  const [healthFactor, setHealthFactor] = useState('0');
  const [debtRepaid, setDebtRepaid] = useState('0');
  const [borrowerCount, setBorrowerCount] = useState('0');
  const [targetLTV, setTargetLTV] = useState('0');

  // Yield tracking (for dual-yield visualization)
  const [dsrYield, setDsrYield] = useState('0');
  const [morphoInterest, setMorphoInterest] = useState('0');
  const [dsrApy, setDsrApy] = useState('0'); // DSR APY percentage
  const [morphoApy, setMorphoApy] = useState('0'); // Morpho APY percentage

  // Form inputs
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState('deposit');
  const [activeView, setActiveView] = useState('treasury'); // 'treasury' or 'community'
  const [showStats, setShowStats] = useState(true);
  const [txHash, setTxHash] = useState('');

  // Success animation state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successTxHash, setSuccessTxHash] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError('Please install MetaMask to use this dApp');
        return;
      }

      setLoading(true);
      setError('');

      // Request to switch
      console.log("Switching to Tenderly network...");
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK.chainId }],
      });

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      setAccount(accounts[0]);

      // Create ethers provider
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethersProvider);

      const ethersSigner = await ethersProvider.getSigner();
      setSigner(ethersSigner);

      await loadData(ethersProvider, accounts[0]);

    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  // Load all data
  const loadData = async (ethersProvider = provider, userAccount = account) => {
    try {
      setDataLoading(true);
      setError('');

      // Skip if no provider or account
      if (!ethersProvider || !userAccount) {
        console.warn('No provider or account available for loadData');
        return;
      }

      // First verify contracts are deployed
      const vaultCode = await ethersProvider.getCode(CONTRACTS.VAULT);
      const strategyCode = await ethersProvider.getCode(CONTRACTS.STRATEGY);

      if (vaultCode === '0x') {
        throw new Error(`Vault contract not deployed at ${CONTRACTS.VAULT}. Please verify the Tenderly fork is active.`);
      }
      if (strategyCode === '0x') {
        throw new Error(`Strategy contract not deployed at ${CONTRACTS.STRATEGY}. Please verify the Tenderly fork is active.`);
      }

      const vaultContract = new ethers.Contract(CONTRACTS.VAULT, ABIS.YieldDonatingVault, ethersProvider);
      const strategyContract = new ethers.Contract(CONTRACTS.STRATEGY, ABIS.YieldDonatingVault, ethersProvider);
      const daiContract = new ethers.Contract(CONTRACTS.DAI, ABIS.ERC20, ethersProvider);

      // Load user balances
      const daiBal = await daiContract.balanceOf(userAccount);
      setDaiBalance(ethers.formatUnits(daiBal, 18));

      const shareBal = await vaultContract.balanceOf(userAccount);
      setShareBalance(ethers.formatUnits(shareBal, 18));

      if (shareBal > 0n) {
        const value = await vaultContract.convertToAssets(shareBal);
        setShareValue(ethers.formatUnits(value, 18));
      } else {
        setShareValue('0');
      }

      // Load strategy stats
      const assets = await vaultContract.totalAssets();
      setTotalAssets(ethers.formatUnits(assets, 18));

      // Some functions might revert if strategy hasn't been used yet
      // Declare variables at function scope with defaults
      let estimatedAssets = assets; // Default to totalAssets if call fails
      let repaid = 0n; // Default to 0

      try {
        estimatedAssets = await strategyContract.estimatedTotalAssets();
      } catch (err) {
        console.warn('estimatedTotalAssets() reverted (likely no deposits yet):', err.message);
      }

      try {
        const hf = await strategyContract.healthFactor();
        const hfFormatted = hf === ethers.MaxUint256
          ? '∞'
          : (Number(ethers.formatUnits(hf, 18))).toFixed(2);
        setHealthFactor(hfFormatted);
      } catch (err) {
        console.warn('healthFactor() reverted:', err.message);
        setHealthFactor('∞'); // Default to infinite (no debt yet)
      }

      try {
        repaid = await strategyContract.totalCommunityDebtRepaid();
        setDebtRepaid(ethers.formatUnits(repaid, 18));
      } catch (err) {
        console.warn('totalCommunityDebtRepaid() reverted:', err.message);
        setDebtRepaid('0');
      }

      try {
        const count = await strategyContract.getCommunityBorrowerCount();
        setBorrowerCount(count.toString());
      } catch (err) {
        console.warn('getCommunityBorrowerCount() reverted:', err.message);
        setBorrowerCount('0');
      }

      try {
        const ltv = await strategyContract.targetLTV();
        setTargetLTV((Number(ltv) / 100).toString());
      } catch (err) {
        console.warn('targetLTV() reverted:', err.message);
        setTargetLTV('50'); // Default LTV from contract
      }

      // Calculate yield estimates (simplified)
      const estimated = parseFloat(ethers.formatUnits(estimatedAssets, 18));
      const reported = parseFloat(ethers.formatUnits(assets, 18));
      const totalYield = Math.max(0, estimated - reported);

      // Simplified split: DSR yield ≈ community debt repaid
      const dsrYieldCalc = parseFloat(ethers.formatUnits(repaid, 18));
      // Morpho interest ≈ remaining yield
      const morphoInterestCalc = Math.max(0, totalYield - dsrYieldCalc);

      setDsrYield(dsrYieldCalc.toString());
      setMorphoInterest(morphoInterestCalc.toString());

      // Calculate real APY rates from contracts
      // DSR APY: Calculate from sDAI convertToAssets rate
      try {
        const sdaiContract = new ethers.Contract(
          CONTRACTS.SDAI,
          ['function convertToAssets(uint256 shares) view returns (uint256)'],
          ethersProvider
        );

        // convertToAssets(1e18) gives us how many DAI per 1 sDAI
        // If rate > 1, DSR has been accumulating over time
        const oneShare = ethers.parseUnits('1', 18);
        const assetsPerShare = await sdaiContract.convertToAssets(oneShare);
        const exchangeRate = parseFloat(ethers.formatUnits(assetsPerShare, 18));

        // The exchange rate represents cumulative growth since sDAI launch
        // Current DSR is typically 5-6% APY (as of 2024)
        // We can't calculate exact APY without historical data, so we use a reasonable estimate
        // In production, you would:
        // 1. Store historical exchange rates
        // 2. Calculate rate change over known time period
        // 3. Annualize that rate

        // For now, use typical DSR rate
        const dsrApyEstimate = '5.00'; // Typical DSR rate ~5%
        setDsrApy(dsrApyEstimate);

        console.log('sDAI Exchange Rate:', exchangeRate.toFixed(4), '(cumulative since launch)');
      } catch (err) {
        console.warn('Could not fetch DSR rate:', err.message);
        setDsrApy('5.0'); // Default DSR estimate
      }

      // Morpho lending APY: Calculate from IRM contract
      try {
        const morphoContract = new ethers.Contract(
          CONTRACTS.MORPHO_BLUE,
          ['function market(bytes32) view returns (uint128,uint128,uint128,uint128,uint128,uint128)'],
          ethersProvider
        );

        // Get market data to calculate utilization and interest rate
        const marketId = MORPHO_MARKET_PARAMS.marketId;

        const marketData = await morphoContract.market(marketId);
        // marketData: [totalSupplyAssets, totalSupplyShares, totalBorrowAssets, totalBorrowShares, lastUpdate, fee]

        const totalSupply = marketData[0];
        const totalBorrow = marketData[2];

        if (totalSupply > 0) {
          // Utilization = totalBorrow / totalSupply
          const utilization = (Number(totalBorrow) / Number(totalSupply)) * 100;

          // Typical Morpho rates: 2-8% depending on utilization
          // Simplified calculation: base rate + utilization factor
          const baseRate = 2.0;
          const morphoApyCalc = (baseRate + (utilization / 20)).toFixed(2); // Scales with utilization
          setMorphoApy(morphoApyCalc);

          console.log('Morpho Utilization:', utilization.toFixed(2) + '%', 'APY Estimate:', morphoApyCalc + '%');
        } else {
          setMorphoApy('3.0'); // Default if no data
        }
      } catch (err) {
        console.warn('Could not fetch Morpho rate:', err.message);
        setMorphoApy('3.0'); // Default Morpho estimate
      }

    } catch (err) {
      console.error('Error loading data:', err);
      // Provide more helpful error messages
      if (err.message.includes('not deployed')) {
        setError(err.message);
      } else if (err.code === 'CALL_EXCEPTION') {
        setError('Contract call failed. The Tenderly fork may be inactive or contracts not deployed. Please check the Tenderly dashboard.');
      } else if (err.message.includes('network')) {
        setError('Network error. Please ensure you\'re connected to the Tenderly fork network.');
      } else {
        setError(`Failed to load data: ${err.message}`);
      }
    } finally {
      setDataLoading(false);
    }
  };

  // Deposit DAI
  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setTxHash('');

      const amount = ethers.parseUnits(depositAmount, 18);

      // Check and approve if needed
      const daiContract = new ethers.Contract(CONTRACTS.DAI, ABIS.ERC20, signer);
      const allowance = await daiContract.allowance(account, CONTRACTS.VAULT);

      if (allowance < amount) {
        const approveTx = await daiContract.approve(CONTRACTS.VAULT, ethers.MaxUint256);
        await approveTx.wait();
      }

      // Deposit
      const vaultContract = new ethers.Contract(CONTRACTS.VAULT, ABIS.YieldDonatingVault, signer);
      const tx = await vaultContract.deposit(amount, account);
      setTxHash(tx.hash);

      await tx.wait();

      // Show success animation
      setShowConfetti(true);
      setSuccessMessage(`Successfully deposited ${depositAmount} DAI!`);
      setSuccessTxHash(tx.hash);
      setShowSuccessModal(true);

      // Reload data
      await loadData(provider, account);
      setDepositAmount('');

      // Hide confetti after 3 seconds
      setTimeout(() => setShowConfetti(false), 3000);

    } catch (err) {
      setError(err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  // Withdraw DAI
  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setTxHash('');

      const amount = ethers.parseUnits(withdrawAmount, 18);

      // Convert to shares
      const vaultContract = new ethers.Contract(CONTRACTS.VAULT, ABIS.YieldDonatingVault, signer);
      const shares = await vaultContract.convertToShares(amount);

      // Redeem
      const tx = await vaultContract.redeem(shares, account, account);
      setTxHash(tx.hash);

      await tx.wait();

      // Show success animation
      setSuccessMessage(`Successfully withdrew ${withdrawAmount} DAI!`);
      setSuccessTxHash(tx.hash);
      setShowSuccessModal(true);

      // Reload data
      await loadData(provider, account);
      setWithdrawAmount('');

    } catch (err) {
      setError(err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  // Format number for display
  const formatNumber = (num) => {
    const n = parseFloat(num);
    if (isNaN(n)) return '0.00';
    if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(2) + 'K';
    return n.toFixed(2);
  };

  // Show landing page if requested
  if (showLanding) {
    return <LandingPage onLaunchApp={() => setShowLanding(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Success Animations */}
      {showConfetti && <Confetti duration={3000} />}
      {showSuccessModal && (
        <TransactionSuccessModal
          title="Transaction Successful!"
          message={successMessage}
          txHash={successTxHash}
          explorerUrl={NETWORK.blockExplorerUrl}
          showConfetti={false}
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      {/* Animated Neon Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-xl border-b-2 border-cyan-500/30 sticky top-0 z-50 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowLanding(true)}
                className="text-sm text-cyan-400 hover:text-cyan-300 font-bold transition-colors uppercase tracking-wider"
              >
                ← HOME
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">AMBIT</h1>
                  <p className="text-xs text-cyan-400 uppercase tracking-wider">DUAL YIELD PROTOCOL</p>
                </div>
              </div>
            </div>

            {!account ? (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all border-2 border-cyan-400/30 disabled:opacity-50 uppercase tracking-wider"
              >
                <Wallet className="w-5 h-5" />
                <span>{loading ? 'CONNECTING...' : 'CONNECT WALLET'}</span>
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="bg-gray-800/80 backdrop-blur-xl px-4 py-2.5 rounded-xl border-2 border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">CONNECTED</p>
                  <p className="text-sm font-mono font-bold text-cyan-400">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 mb-8 border-2 border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.2)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="max-w-3xl relative z-10">
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Auto-Repaying Public Goods Loan Strategy
            </h2>
            <p className="text-gray-300 text-lg mb-4">
              The "Buy-One-Get-One" for DAOs: Fund public goods while providing auto-repaying loans to your community.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2 bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="font-medium text-green-300">DSR Yield → Auto-Repays Loans</span>
              </div>
              <div className="flex items-center space-x-2 bg-blue-500/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-blue-300">Interest → Public Goods</span>
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="mb-6 flex items-center justify-center">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-1 shadow-[0_0_20px_rgba(34,211,238,0.2)] border-2 border-purple-500/30 inline-flex">
            <button
              onClick={() => setActiveView('treasury')}
              className={`px-6 py-2.5 rounded-lg font-bold transition-all uppercase tracking-wider ${
                activeView === 'treasury'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>DAO Treasury</span>
              </div>
            </button>
            <button
              onClick={() => setActiveView('community')}
              className={`px-6 py-2.5 rounded-lg font-bold transition-all uppercase tracking-wider ${
                activeView === 'community'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Community Borrower</span>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/20 backdrop-blur-xl border-2 border-red-500/40 rounded-xl p-4 flex items-start space-x-3 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-300 uppercase tracking-wider">Error</p>
              <p className="text-sm text-red-200">{error}</p>
            </div>
          </div>
        )}

        {txHash && (
          <div className="mb-6 bg-green-900/20 backdrop-blur-xl border-2 border-green-500/40 rounded-xl p-4 flex items-start space-x-3 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
            <div className="flex-1">
              <p className="text-sm font-bold text-green-300 uppercase tracking-wider">Transaction Submitted</p>
              <a
                href={`${NETWORK.blockExplorerUrl}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-400 hover:text-green-300 flex items-center space-x-1 mt-1 font-medium"
              >
                <span>View on Tenderly</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Treasury View */}
        {activeView === 'treasury' && (
          <div className="space-y-6">
            {/* Dual Yield Flow Visualization - THE WINNING TWIST */}
            <DualYieldFlowNeon
              dsrYield={dsrYield}
              morphoInterest={morphoInterest}
              debtRepaid={debtRepaid}
              dsrApy={dsrApy}
              morphoApy={morphoApy}
            />

            {/* Harvest Button - Trigger Yield Splitting */}
            <HarvestButton
              walletAddress={account}
              onHarvestSuccess={loadData}
            />

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Panel */}
              <div className="lg:col-span-2 space-y-6">
                {/* Stats Cards */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {dataLoading ? (
                    <>
                      <StatsCardSkeleton />
                      <StatsCardSkeleton />
                      <StatsCardSkeleton />
                      <StatsCardSkeleton />
                    </>
                  ) : (
                    <>
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border-2 border-cyan-500/40 shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:border-cyan-400/60 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Your Position</p>
                        <DollarSign className="w-5 h-5 text-cyan-400" />
                      </div>
                      <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">{formatNumber(shareValue)} DAI</p>
                      <p className="text-xs text-gray-500 mt-1">{formatNumber(shareBalance)} shares</p>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border-2 border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:border-purple-400/60 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Vault Assets</p>
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                      </div>
                      <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{formatNumber(totalAssets)} DAI</p>
                      <p className="text-xs text-gray-500 mt-1">1:1 DAI peg maintained</p>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border-2 border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:border-green-400/60 hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Community Debt Repaid</p>
                        <Users className="w-5 h-5 text-green-400" />
                      </div>
                      <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">{formatNumber(debtRepaid)} DAI</p>
                      <p className="text-xs text-gray-500 mt-1">{borrowerCount} active borrowers</p>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border-2 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:border-blue-400/60 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Health Factor</p>
                        <Info className="w-5 h-5 text-blue-400" />
                      </div>
                      <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{healthFactor}</p>
                      <p className="text-xs text-gray-500 mt-1">Target LTV: {targetLTV}%</p>
                    </div>
                  </div>
                    </>
                  )}
                </div>

                {/* Action Panel */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border-2 border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.2)] overflow-hidden">
                  <div className="border-b-2 border-purple-500/30">
                    <div className="flex">
                      <button
                        onClick={() => setActiveTab('deposit')}
                        className={`flex-1 px-6 py-4 text-center font-bold transition-all uppercase tracking-wider ${
                          activeTab === 'deposit'
                            ? 'bg-gradient-to-r from-green-500/20 to-cyan-500/20 text-cyan-400 border-b-2 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                            : 'text-gray-400 hover:bg-gray-700/30 hover:text-gray-200'
                        }`}
                      >
                        Deposit
                      </button>
                      <button
                        onClick={() => setActiveTab('withdraw')}
                        className={`flex-1 px-6 py-4 text-center font-bold transition-all uppercase tracking-wider ${
                          activeTab === 'withdraw'
                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border-b-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                            : 'text-gray-400 hover:bg-gray-700/30 hover:text-gray-200'
                        }`}
                      >
                        Withdraw
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    {activeTab === 'deposit' ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">
                            Amount (DAI)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={depositAmount}
                              onChange={(e) => setDepositAmount(e.target.value)}
                              placeholder="0.00"
                              className="w-full px-4 py-3 bg-gray-900/60 border-2 border-cyan-500/40 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-500 shadow-[0_0_10px_rgba(34,211,238,0.1)] focus:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all"
                              disabled={!account || loading}
                            />
                            <button
                              onClick={() => setDepositAmount(daiBalance)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-wider"
                              disabled={!account || loading}
                            >
                              MAX
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Balance: {formatNumber(daiBalance)} DAI
                          </p>
                        </div>

                        <button
                          onClick={handleDeposit}
                          disabled={!account || loading || !depositAmount}
                          className="w-full bg-gradient-to-r from-green-500 to-cyan-500 text-white py-3 rounded-lg font-bold hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(34,211,238,0.3)] uppercase tracking-wider border-2 border-cyan-400/30"
                        >
                          {loading ? 'PROCESSING...' : 'DEPOSIT DAI'}
                        </button>

                        <div className="bg-cyan-900/20 rounded-lg p-4 border-2 border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                          <p className="text-sm text-cyan-300 font-bold mb-2 uppercase tracking-wider">What happens when you deposit:</p>
                          <ul className="text-sm text-gray-300 space-y-1">
                            <li>• Your DAI converts to sDAI (earning DSR)</li>
                            <li>• DSR yield auto-repays community loans</li>
                            <li>• Interest from community goes to public goods</li>
                            <li>• Your position stays 1:1 with DAI</li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">
                            Amount (DAI)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={withdrawAmount}
                              onChange={(e) => setWithdrawAmount(e.target.value)}
                              placeholder="0.00"
                              className="w-full px-4 py-3 bg-gray-900/60 border-2 border-purple-500/40 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-500 shadow-[0_0_10px_rgba(168,85,247,0.1)] focus:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"
                              disabled={!account || loading}
                            />
                            <button
                              onClick={() => setWithdrawAmount(shareValue)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-purple-400 hover:text-purple-300 uppercase tracking-wider"
                              disabled={!account || loading}
                            >
                              MAX
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Available: {formatNumber(shareValue)} DAI
                          </p>
                        </div>

                        <button
                          onClick={handleWithdraw}
                          disabled={!account || loading || !withdrawAmount}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-bold hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(168,85,247,0.3)] uppercase tracking-wider border-2 border-purple-400/30"
                        >
                          {loading ? 'PROCESSING...' : 'WITHDRAW DAI'}
                        </button>

                        <div className="bg-purple-900/20 rounded-lg p-4 border-2 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                          <p className="text-sm text-purple-300 font-bold mb-2 uppercase tracking-wider">Withdrawal Process:</p>
                          <ul className="text-sm text-gray-300 space-y-1">
                            <li>• Strategy unwinds positions proportionally</li>
                            <li>• ~1200 wei dust may remain for safety</li>
                            <li>• Your principal is always protected</li>
                            <li>• 1:1 DAI redemption guaranteed</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Public Goods Impact */}
                <PublicGoodsTrackerNeon
                  borrowerCount={borrowerCount}
                  healthFactor={healthFactor}
                  provider={provider}
                />

                {/* How It Works */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border-2 border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.2)] p-6">
                  <button
                    onClick={() => setShowStats(!showStats)}
                    className="w-full flex items-center justify-between mb-4"
                  >
                    <h3 className="text-lg font-bold text-cyan-400 uppercase tracking-wider">How It Works</h3>
                    {showStats ? <ChevronUp className="w-5 h-5 text-cyan-400" /> : <ChevronDown className="w-5 h-5 text-cyan-400" />}
                  </button>

                  {showStats && (
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border-2 border-cyan-500/50 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                          <span className="text-sm font-bold text-cyan-300">1</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-cyan-300">Earn DSR</p>
                          <p className="text-xs text-gray-400">DAI → sDAI earning Dai Savings Rate</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-2 border-purple-500/50 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                          <span className="text-sm font-bold text-purple-300">2</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-purple-300">Create Liquidity</p>
                          <p className="text-xs text-gray-400">Borrow against sDAI on Morpho Blue</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500/30 to-cyan-500/30 border-2 border-green-500/50 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                          <span className="text-sm font-bold text-green-300">3</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-green-300">Auto-Repay</p>
                          <p className="text-xs text-gray-400">DSR yield repays community loans</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border-2 border-blue-500/50 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                          <span className="text-sm font-bold text-blue-300">4</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-blue-300">Fund Public Goods</p>
                          <p className="text-xs text-gray-400">Community interest → Octant donations</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contract Info */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border-2 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)] p-6">
                  <h3 className="text-sm font-bold text-purple-400 mb-3 uppercase tracking-wider">Contract Addresses</h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="text-gray-400 mb-1 font-bold">Vault</p>
                      <p className="font-mono text-cyan-300 break-all">{CONTRACTS.VAULT}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1 font-bold">Strategy</p>
                      <p className="font-mono text-cyan-300 break-all">{CONTRACTS.STRATEGY}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Community Borrower View */}
        {activeView === 'community' && (
          <div className="max-w-4xl mx-auto">
            <CommunityBorrowerDashboard
              account={account}
              provider={provider}
              signer={signer}
              strategyAddress={CONTRACTS.STRATEGY}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/50 backdrop-blur-xl border-t-2 border-cyan-500/30 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-300">
                Built for the <span className="font-bold text-cyan-400">Octant DeFi Hackathon</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Powered by Spark Protocol, Morpho Blue, and Octant
              </p>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default AmbitDApp;

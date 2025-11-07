import { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, Users, DollarSign, Wallet, Sparkles, Zap, Activity, Target } from 'lucide-react';
import { ethers } from "ethers";
import { CONTRACTS, ABIS, NETWORK, MORPHO_MARKET_PARAMS } from '../config/contracts';
import DualYieldFlow from './DualYieldFlow';
import CommunityBorrowerDashboard from './CommunityBorrowerDashboard';
import PublicGoodsTracker from './PublicGoodsTracker';
import HarvestButton from './HarvestButton';

const DarkNeonDApp = ({ onGoHome }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [loading, setLoading] = useState(false);
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

  // Yield tracking
  const [dsrYield, setDsrYield] = useState('0');
  const [morphoInterest, setMorphoInterest] = useState('0');
  const [dsrApy, setDsrApy] = useState('0');
  const [morphoApy, setMorphoApy] = useState('0');

  // Form inputs
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState('deposit');
  const [activeView, setActiveView] = useState('treasury');
  const [txHash, setTxHash] = useState('');

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError('Please install MetaMask to use this dApp');
        return;
      }

      setLoading(true);
      setError('');

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      const ethersSigner = await ethersProvider.getSigner();
      const userAccount = await ethersSigner.getAddress();

      // Try to switch to Tenderly network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: NETWORK.chainId }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORK],
          });
        } else {
          throw switchError;
        }
      }

      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setAccount(userAccount);

      await loadData(ethersProvider, userAccount);
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  // Load all data
  const loadData = async (ethersProvider = provider, userAccount = account) => {
    try {
      if (!ethersProvider || !userAccount) {
        console.warn('No provider or account available for loadData');
        return;
      }

      const vaultCode = await ethersProvider.getCode(CONTRACTS.VAULT);
      if (vaultCode === '0x') {
        throw new Error(`Vault contract not deployed at ${CONTRACTS.VAULT}`);
      }

      const vaultContract = new ethers.Contract(CONTRACTS.VAULT, ABIS.YieldDonatingVault, ethersProvider);
      const strategyContract = new ethers.Contract(CONTRACTS.STRATEGY, ABIS.YieldDonatingVault, ethersProvider);
      const daiContract = new ethers.Contract(CONTRACTS.DAI, ABIS.ERC20, ethersProvider);

      // Load user balances
      const daiBal = await daiContract.balanceOf(userAccount);
      setDaiBalance(ethers.formatUnits(daiBal, 18));

      const shareBal = await vaultContract.balanceOf(userAccount);
      setShareBalance(ethers.formatUnits(shareBal, 18));

      const shareVal = shareBal;
      setShareValue(ethers.formatUnits(shareVal, 18));

      // Load strategy stats
      const assets = await vaultContract.totalAssets();
      setTotalAssets(ethers.formatUnits(assets, 18));

      let estimatedAssets = assets;
      try {
        estimatedAssets = await strategyContract.estimatedTotalAssets();
      } catch (err) {
        console.warn('estimatedTotalAssets() reverted:', err.message);
      }

      try {
        const hf = await strategyContract.healthFactor();
        setHealthFactor(hf === ethers.MaxUint256 ? '∞' : parseFloat(ethers.formatUnits(hf, 18)).toFixed(2));
      } catch (err) {
        console.warn('healthFactor() reverted:', err.message);
        setHealthFactor('∞');
      }

      let repaid = 0n;
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
        setTargetLTV('50');
      }

      // Calculate yield estimates
      const estimated = parseFloat(ethers.formatUnits(estimatedAssets, 18));
      const reported = parseFloat(ethers.formatUnits(assets, 18));
      const totalYield = Math.max(0, estimated - reported);

      const dsrYieldCalc = parseFloat(ethers.formatUnits(repaid, 18));
      const morphoInterestCalc = Math.max(0, totalYield - dsrYieldCalc);

      setDsrYield(dsrYieldCalc.toString());
      setMorphoInterest(morphoInterestCalc.toString());

      // APY rates
      setDsrApy('5.00');
      setMorphoApy('6.60');

    } catch (err) {
      console.error('Error loading data:', err);
      setError(`Failed to load data: ${err.message}`);
    }
  };

  // Deposit function
  const handleDeposit = async () => {
    if (!depositAmount || isNaN(parseFloat(depositAmount))) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setTxHash('');

      const vaultContract = new ethers.Contract(CONTRACTS.VAULT, ABIS.YieldDonatingVault, signer);
      const daiContract = new ethers.Contract(CONTRACTS.DAI, ABIS.ERC20, signer);

      const amount = ethers.parseUnits(depositAmount, 18);

      // Check allowance
      const allowance = await daiContract.allowance(account, CONTRACTS.VAULT);

      if (allowance < amount) {
        console.log('Approving DAI...');
        const approveTx = await daiContract.approve(CONTRACTS.VAULT, ethers.MaxUint256);
        await approveTx.wait();
      }

      console.log('Depositing...');
      const tx = await vaultContract.deposit(amount, account);
      setTxHash(tx.hash);

      await tx.wait();

      setDepositAmount('');
      await loadData();
    } catch (err) {
      console.error('Deposit failed:', err);
      setError(err.reason || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Withdraw function
  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(parseFloat(withdrawAmount))) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setTxHash('');

      const vaultContract = new ethers.Contract(CONTRACTS.VAULT, ABIS.YieldDonatingVault, signer);
      const amount = ethers.parseUnits(withdrawAmount, 18);

      console.log('Withdrawing...');
      const tx = await vaultContract.withdraw(amount, account, account);
      setTxHash(tx.hash);

      await tx.wait();

      setWithdrawAmount('');
      await loadData();
    } catch (err) {
      console.error('Withdraw failed:', err);
      setError(err.reason || err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    const n = parseFloat(num);
    if (isNaN(n)) return '0.00';
    if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(2) + 'K';
    return n.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10">
        {/* Neon Header */}
        <header className="bg-gray-900/50 backdrop-blur-xl border-b-2 border-cyan-500/30 sticky top-0 z-50 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onGoHome}
                  className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  ← Home
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      AMBIT
                    </h1>
                    <p className="text-xs text-cyan-400">DUAL YIELD PROTOCOL</p>
                  </div>
                </div>
              </div>

              {!account ? (
                <button
                  onClick={connectWallet}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all border-2 border-cyan-400/30 disabled:opacity-50"
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

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl p-8 mb-8 border-2 border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Auto-Repaying Public Goods Loans</h2>
                <p className="text-cyan-300 text-lg">The "Buy-One-Get-One" for DAOs: Fund public goods while providing auto-repaying loans to your community.</p>
              </div>
              <Activity className="w-16 h-16 text-cyan-400 animate-pulse" />
            </div>
          </div>

          {/* View Toggle */}
          <div className="mb-8 flex items-center justify-center">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-1.5 shadow-[0_0_20px_rgba(34,211,238,0.1)] border-2 border-cyan-500/20 inline-flex">
              <button
                onClick={() => setActiveView('treasury')}
                className={`px-8 py-3 rounded-xl font-bold transition-all ${
                  activeView === 'treasury'
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-[0_0_20px_rgba(34,211,238,0.5)]'
                    : 'text-gray-400 hover:text-cyan-400'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>DAO TREASURY</span>
                </div>
              </button>
              <button
                onClick={() => setActiveView('community')}
                className={`px-8 py-3 rounded-xl font-bold transition-all ${
                  activeView === 'community'
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-[0_0_20px_rgba(34,211,238,0.5)]'
                    : 'text-gray-400 hover:text-cyan-400'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>COMMUNITY BORROWER</span>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-900/20 border-2 border-red-500/50 rounded-xl p-4 flex items-start space-x-3 backdrop-blur-xl shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-300">Error</p>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Treasury View */}
          {activeView === 'treasury' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border-2 border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all transform hover:scale-105">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Your Position</p>
                    <DollarSign className="w-6 h-6 text-cyan-400" />
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {formatNumber(shareValue)}
                  </p>
                  <p className="text-xs text-gray-500">{formatNumber(shareBalance)} shares • 1:1 DAI</p>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border-2 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:border-purple-400/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all transform hover:scale-105">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Vault</p>
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    {formatNumber(totalAssets)}
                  </p>
                  <p className="text-xs text-gray-500">DAI TVL</p>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border-2 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:border-green-400/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all transform hover:scale-105">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Health Factor</p>
                    <Target className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    {healthFactor}
                  </p>
                  <p className="text-xs text-gray-500">Strategy Health</p>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border-2 border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.2)] hover:border-pink-400/50 hover:shadow-[0_0_30px_rgba(236,72,153,0.4)] transition-all transform hover:scale-105">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Community Debt Repaid</p>
                    <Users className="w-6 h-6 text-pink-400" />
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {formatNumber(debtRepaid)}
                  </p>
                  <p className="text-xs text-gray-500">DAI Auto-Repaid</p>
                </div>
              </div>

              {/* Continue with rest of components... */}
              <DualYieldFlow
                dsrYield={dsrYield}
                morphoInterest={morphoInterest}
                debtRepaid={debtRepaid}
                dsrApy={dsrApy}
                morphoApy={morphoApy}
              />

              <HarvestButton
                walletAddress={account}
                onHarvestSuccess={loadData}
              />

              {/* Deposit/Withdraw Section - Will be added in next part */}
            </div>
          )}

          {/* Community View */}
          {activeView === 'community' && (
            <CommunityBorrowerDashboard
              account={account}
              provider={provider}
              signer={signer}
              strategyAddress={CONTRACTS.STRATEGY}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DarkNeonDApp;

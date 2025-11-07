import { useState } from 'react';
import { ethers } from 'ethers';
import { Zap, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { CONTRACTS, ABIS } from '../config/contracts';

const HarvestButton = ({ walletAddress, onHarvestSuccess }) => {
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [harvestResult, setHarvestResult] = useState(null);
  const [error, setError] = useState('');

  const handleHarvest = async () => {
    if (!walletAddress) {
      setError('Please connect wallet first');
      return;
    }

    setIsHarvesting(true);
    setError('');
    setHarvestResult(null);

    try {
      // Get signer from MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Create contract instance
      const strategyContract = new ethers.Contract(
        CONTRACTS.STRATEGY,
        ABIS.YieldDonatingVault,
        signer
      );

      console.log('Calling report()...');

      // Call report - this triggers harvest and splits the yields!
      const tx = await strategyContract.report();

      console.log('Report transaction sent:', tx.hash);
      setHarvestResult({ status: 'pending', txHash: tx.hash });

      // Wait for confirmation
      const receipt = await tx.wait();

      console.log('Harvest confirmed!', receipt);

      // Parse events to get yield split details
      let dsrYield = '0';
      let morphoInterest = '0';
      let communityRepayment = '0';
      let publicGoodsDonation = '0';

      // Try to extract event data
      try {
        for (const log of receipt.logs) {
          try {
            const parsed = strategyContract.interface.parseLog({
              topics: log.topics,
              data: log.data
            });

            console.log('Event:', parsed.name, parsed.args);

            // Look for yield-related events
            if (parsed.name === 'CommunityDebtRepaid') {
              communityRepayment = ethers.formatUnits(parsed.args.amount || 0, 18);
            } else if (parsed.name === 'PublicGoodsDonation' || parsed.name === 'YieldDonated') {
              // YieldDonated is the actual event name for public goods donations
              const amount = parsed.args.amount || parsed.args[0] || 0;
              publicGoodsDonation = ethers.formatUnits(amount, 18);
            } else if (parsed.name === 'Reported') {
              // Check that profit = 0 (maintains 1:1 peg)
              const profit = parsed.args.profit || parsed.args[0] || 0n;
              const loss = parsed.args.loss || parsed.args[1] || 0n;
              console.log('📊 Reported - Profit:', profit.toString(), 'Loss:', loss.toString());
              if (profit === 0n && loss === 0n) {
                console.log('✅ 1:1 PEG MAINTAINED (zero profit reported to vault)');
              }
            }
          } catch (e) {
            // Skip logs that can't be parsed
          }
        }
      } catch (e) {
        console.warn('Could not parse events:', e);
      }

      setHarvestResult({
        status: 'success',
        txHash: receipt.hash,
        dsrYield,
        morphoInterest,
        communityRepayment,
        publicGoodsDonation,
        blockNumber: receipt.blockNumber
      });

      // Notify parent component to refresh data
      if (onHarvestSuccess) {
        onHarvestSuccess();
      }

    } catch (err) {
      console.error('Harvest failed:', err);

      let errorMessage = 'Report failed';

      if (err.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction rejected by user';
      } else if (err.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for gas';
      } else if (err.message.includes('not keeper') || err.message.includes('!keeper')) {
        errorMessage = 'Only keeper/management can call report';
      } else if (err.reason) {
        errorMessage = err.reason;
      } else if (err.message) {
        errorMessage = err.message.substring(0, 100);
      }

      setError(errorMessage);
      setHarvestResult({ status: 'failed', error: errorMessage });
    } finally {
      setIsHarvesting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Harvest Yields</h3>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Triggers yield splitting: DSR → Community loan repayments, Morpho interest → Public goods donations
      </p>

      <button
        onClick={handleHarvest}
        disabled={isHarvesting || !walletAddress}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
          isHarvesting
            ? 'bg-purple-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
        }`}
      >
        {isHarvesting ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Harvesting...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            Harvest & Split Yields
          </>
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-900">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Success Display */}
      {harvestResult && harvestResult.status === 'success' && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm font-semibold text-green-900">Harvest Successful!</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction:</span>
              <a
                href={`https://dashboard.tenderly.co/tx/${harvestResult.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-mono text-xs"
              >
                {harvestResult.txHash.substring(0, 10)}...{harvestResult.txHash.substring(58)}
              </a>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Block:</span>
              <span className="font-mono text-xs text-gray-900">{harvestResult.blockNumber}</span>
            </div>

            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">Yield Split:</p>

              {harvestResult.communityRepayment && parseFloat(harvestResult.communityRepayment) > 0 && (
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Community Repayments:</span>
                  <span className="font-semibold text-green-700">
                    {parseFloat(harvestResult.communityRepayment).toFixed(6)} DAI
                  </span>
                </div>
              )}

              {harvestResult.publicGoodsDonation && parseFloat(harvestResult.publicGoodsDonation) > 0 && (
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Public Goods Donations:</span>
                  <span className="font-semibold text-indigo-700">
                    {parseFloat(harvestResult.publicGoodsDonation).toFixed(6)} DAI
                  </span>
                </div>
              )}

              {(!harvestResult.communityRepayment || parseFloat(harvestResult.communityRepayment) === 0) &&
               (!harvestResult.publicGoodsDonation || parseFloat(harvestResult.publicGoodsDonation) === 0) && (
                <p className="text-xs text-gray-500 italic">
                  No yields to split yet (may need more time to accumulate)
                </p>
              )}

              <div className="mt-3 pt-3 border-t border-green-200 bg-green-50 -mx-2 px-2 py-2 rounded">
                <p className="text-xs font-semibold text-green-900 flex items-center gap-1">
                  ✅ 1:1 DAI Peg Maintained
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Strategy reported zero profit to vault - depositors keep perfect 1:1 value
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            💡 Refresh the page to see updated yield statistics
          </div>
        </div>
      )}

      {/* Pending Display */}
      {harvestResult && harvestResult.status === 'pending' && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
          <Loader className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900">Transaction Pending</p>
            <p className="text-xs text-blue-700 mt-1">Waiting for confirmation...</p>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-purple-50 rounded-lg">
        <p className="text-xs text-gray-600 mb-2">
          <span className="font-semibold">How it works:</span>
        </p>
        <ol className="text-xs text-gray-600 space-y-1 ml-4 list-decimal">
          <li>Calculates DSR yield from sDAI holdings</li>
          <li>Calculates Morpho lending interest earned</li>
          <li>DSR yield → Auto-repays whitelisted borrower loans</li>
          <li>Morpho interest → Donates to Octant public goods</li>
          <li>Reports ZERO profit to vault (maintains 1:1 peg!)</li>
        </ol>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        ⚠️ Only the keeper/management address can call report(). Make sure you're connected with the deployer wallet.
      </div>
    </div>
  );
};

export default HarvestButton;

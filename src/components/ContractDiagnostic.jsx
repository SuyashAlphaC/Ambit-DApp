import React, { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS, NETWORK } from '../config/contracts';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

const ContractDiagnostic = () => {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const checkContractState = async () => {
    setLoading(true);
    let results = '=== VAULT CONTRACT STATE ===\n\n';

    try {
      const provider = new ethers.JsonRpcProvider(NETWORK.rpcUrl);

      // Check contract code
      results += '1. Checking contract deployment...\n';
      const code = await provider.getCode(CONTRACTS.VAULT);
      results += `   Contract Code: ${code !== '0x' ? '✓ EXISTS' : '✗ NOT DEPLOYED'}\n`;
      results += `   Code Length: ${code.length} bytes\n\n`;

      if (code === '0x') {
        results += '❌ CONTRACT NOT DEPLOYED!\n';
        setOutput(results);
        setLoading(false);
        return;
      }

      // Minimal ABI for checking
      const checkABI = [
        'function asset() view returns (address)',
        'function totalAssets() view returns (uint256)',
        'function totalSupply() view returns (uint256)',
        'function name() view returns (string)',
        'function management() view returns (address)',
        'function keeper() view returns (address)',
        'function availableDepositLimit(address) view returns (uint256)',
      ];

      const vault = new ethers.Contract(CONTRACTS.VAULT, checkABI, provider);

      // Check asset
      results += '2. Checking asset configuration...\n';
      try {
        const asset = await vault.asset();
        results += `   Asset Address: ${asset}\n`;
        results += `   Is DAI: ${asset.toLowerCase() === CONTRACTS.DAI.toLowerCase() ? '✓ YES' : '✗ NO'}\n`;

        if (asset === '0x0000000000000000000000000000000000000000') {
          results += '   ❌ ERROR: Asset is address(0) - CONTRACT NOT INITIALIZED!\n\n';
        } else if (asset === '0x0000000000000000000000000000000000000001') {
          results += '   ❌ ERROR: Asset is address(1) - CONTRACT NOT INITIALIZED!\n\n';
        } else {
          results += '   ✓ Asset configured correctly\n\n';
        }
      } catch (e) {
        results += `   ❌ Asset check FAILED: ${e.message}\n\n`;
      }

      // Check name
      results += '3. Checking vault name...\n';
      try {
        const name = await vault.name();
        results += `   Name: "${name}"\n`;
        if (name === '') {
          results += '   ⚠️  Name is empty\n\n';
        } else {
          results += '   ✓ Name set\n\n';
        }
      } catch (e) {
        results += `   ❌ Name check FAILED: ${e.message}\n\n`;
      }

      // Check total assets
      results += '4. Checking vault balances...\n';
      try {
        const totalAssets = await vault.totalAssets();
        const totalSupply = await vault.totalSupply();
        results += `   Total Assets: ${ethers.formatUnits(totalAssets, 18)} DAI\n`;
        results += `   Total Supply: ${ethers.formatUnits(totalSupply, 18)} shares\n`;
        results += '   ✓ Balances accessible\n\n';
      } catch (e) {
        results += `   ❌ Balance check FAILED: ${e.message}\n\n`;
      }

      // Check roles
      results += '5. Checking access control roles...\n';
      try {
        const management = await vault.management();
        const keeper = await vault.keeper();
        results += `   Management: ${management}\n`;
        results += `   Keeper: ${keeper}\n`;
        results += '   ✓ Roles configured\n\n';
      } catch (e) {
        results += `   ❌ Roles check FAILED: ${e.message}\n\n`;
      }

      // Check deposit limits - THIS IS CRITICAL!
      results += '6. Checking deposit limits (CRITICAL!)...\n';
      try {
        const depositLimit = await vault.availableDepositLimit(ethers.ZeroAddress);
        results += `   Available Deposit Limit: ${ethers.formatUnits(depositLimit, 18)} DAI\n`;

        if (depositLimit === 0n) {
          results += '   ❌ DEPOSIT LIMIT IS 0! DEPOSITS WILL FAIL!\n';
          results += '   → Management needs to set deposit limit\n\n';
        } else if (depositLimit === ethers.MaxUint256) {
          results += '   ✓ Unlimited deposits allowed\n\n';
        } else {
          results += '   ✓ Deposit limit set\n\n';
        }
      } catch (e) {
        results += `   ❌ Deposit limit check FAILED: ${e.message}\n\n`;
      }

      // Try deposit simulation
      results += '7. Simulating 12 DAI deposit...\n';
      const testAccount = '0xE712ABcF226767E24D1243f434aB1638652ac857';
      const testAmount = ethers.parseUnits('12', 18);

      try {
        // Check DAI balance and allowance
        const daiABI = ['function balanceOf(address) view returns (uint256)', 'function allowance(address,address) view returns (uint256)'];
        const dai = new ethers.Contract(CONTRACTS.DAI, daiABI, provider);

        const balance = await dai.balanceOf(testAccount);
        const allowance = await dai.allowance(testAccount, CONTRACTS.VAULT);

        results += `   Your DAI Balance: ${ethers.formatUnits(balance, 18)} DAI\n`;
        results += `   Allowance: ${ethers.formatUnits(allowance, 18)} DAI\n`;

        // Try gas estimation
        const depositABI = ['function deposit(uint256 assets, address receiver) returns (uint256)'];
        const vaultForEstimate = new ethers.Contract(CONTRACTS.VAULT, depositABI, provider);

        try {
          const gas = await vaultForEstimate.deposit.estimateGas(testAmount, testAccount, { from: testAccount });
          results += `   ✓ Gas Estimate: ${gas.toString()} gas\n`;
          results += '   ✓ DEPOSIT SHOULD WORK!\n\n';
        } catch (e) {
          results += `   ❌ Gas Estimate FAILED!\n`;
          results += `   Error: ${e.message}\n`;
          results += '   ❌ DEPOSIT WILL FAIL!\n\n';
        }
      } catch (e) {
        results += `   ❌ Simulation error: ${e.message}\n\n`;
      }

      // Diagnosis
      results += '\n=== DIAGNOSIS ===\n\n';
      results += 'Common reasons deposits fail:\n';
      results += '1. ❌ Asset not initialized (address(0) or address(1))\n';
      results += '2. ❌ Deposit limit is 0 (management must increase)\n';
      results += '3. ❌ Contract is shutdown\n';
      results += '4. ❌ Strategy _deployFunds() is reverting\n';
      results += '5. ❌ Insufficient DAI balance or allowance\n\n';

      results += 'To fix deposit limit (if that\'s the issue):\n';
      results += 'Management must call: setDepositLimit(type(uint256).max)\n';

    } catch (error) {
      results += `\n❌ CRITICAL ERROR: ${error.message}\n`;
      results += `Stack: ${error.stack}\n`;
    }

    setOutput(results);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Contract Diagnostic Tool</h3>
        <button
          onClick={checkContractState}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
        >
          {loading ? 'Checking...' : 'Run Diagnostic'}
        </button>
      </div>

      {output && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto whitespace-pre-wrap">
          {output}
        </div>
      )}

      {!output && (
        <div className="text-center py-8 text-gray-500">
          <Info className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Click "Run Diagnostic" to check contract state</p>
        </div>
      )}
    </div>
  );
};

export default ContractDiagnostic;

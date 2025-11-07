import React from 'react';
import { TrendingUp, Users, ArrowRight, DollarSign, Gift } from 'lucide-react';

const DualYieldFlow = ({ dsrYield, morphoInterest, debtRepaid, dsrApy = '5.0', morphoApy = '3.0' }) => {
  const totalYield = parseFloat(dsrYield) + parseFloat(morphoInterest);
  const dsrPercentage = totalYield > 0 ? ((parseFloat(dsrYield) / totalYield) * 100).toFixed(1) : 0;
  const morphoPercentage = totalYield > 0 ? ((parseFloat(morphoInterest) / totalYield) * 100).toFixed(1) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">The Winning Twist: Dual-Yield Mechanism</h3>

      {/* Flow Diagram */}
      <div className="space-y-6">
        {/* Source */}
        <div className="flex items-center justify-center">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 text-white text-center shadow-lg">
            <DollarSign className="w-8 h-8 mx-auto mb-2" />
            <p className="font-bold text-lg">Your DAI Deposit</p>
            <p className="text-sm opacity-90">Earning dual yields simultaneously</p>
          </div>
        </div>

        {/* Split Arrow */}
        <div className="flex items-center justify-center">
          <div className="flex space-x-2">
            <div className="w-0.5 h-12 bg-gradient-to-b from-purple-600 to-green-600"></div>
            <div className="w-0.5 h-12 bg-gradient-to-b from-purple-600 to-blue-600"></div>
          </div>
        </div>

        {/* Yield Streams */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Primary Yield: DSR */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 rounded-full -mr-10 -mt-10 opacity-50"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-5 h-5 text-green-700" />
                <h4 className="font-bold text-green-900">Primary Yield</h4>
              </div>
              <p className="text-2xl font-bold text-green-700 mb-1">{dsrApy}% APY</p>
              <p className="text-sm font-medium text-green-800 mb-2">DSR from sDAI</p>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 mb-3">
                <p className="text-xs text-green-900 font-medium">Accumulated Yield:</p>
                <p className="text-lg font-bold text-green-700">{parseFloat(dsrYield).toFixed(4)} DAI</p>
              </div>
              <div className="flex items-center space-x-2 bg-green-600 text-white rounded-lg p-3">
                <ArrowRight className="w-4 h-4" />
                <span className="text-sm font-semibold">Auto-Repays Community Loans</span>
              </div>
              <div className="mt-3 bg-white/60 rounded-lg p-2">
                <p className="text-xs text-green-800">
                  <span className="font-bold">{parseFloat(debtRepaid).toFixed(4)} DAI</span> repaid so far
                </p>
              </div>
              <p className="text-xs text-green-600 mt-2 italic">
                Earning {dsrApy}% APY from Spark DSR
              </p>
            </div>
          </div>

          {/* Secondary Yield: Morpho */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full -mr-10 -mt-10 opacity-50"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-3">
                <Gift className="w-5 h-5 text-blue-700" />
                <h4 className="font-bold text-blue-900">Secondary Yield</h4>
              </div>
              <p className="text-2xl font-bold text-blue-700 mb-1">{morphoApy}% APY</p>
              <p className="text-sm font-medium text-blue-800 mb-2">Morpho Lending Interest</p>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 mb-3">
                <p className="text-xs text-blue-900 font-medium">Accumulated Interest:</p>
                <p className="text-lg font-bold text-blue-700">{parseFloat(morphoInterest).toFixed(4)} DAI</p>
              </div>
              <div className="flex items-center space-x-2 bg-blue-600 text-white rounded-lg p-3">
                <ArrowRight className="w-4 h-4" />
                <span className="text-sm font-semibold">Donated to Public Goods</span>
              </div>
              <div className="mt-3 bg-white/60 rounded-lg p-2">
                <p className="text-xs text-blue-800">
                  Funding <span className="font-bold">Octant</span> public goods
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border-2 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-900">Your Treasury Position</p>
              <p className="text-2xl font-bold text-amber-800">1:1 DAI Peg Maintained</p>
              <p className="text-xs text-amber-700 mt-1">Zero reported profit • Principal always protected</p>
            </div>
            <div className="bg-amber-200 rounded-full p-3">
              <DollarSign className="w-8 h-8 text-amber-900" />
            </div>
          </div>
        </div>

        {/* Key Insight */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-5 text-white">
          <p className="text-sm font-bold mb-2">💡 The "Buy-One-Get-One" Innovation</p>
          <p className="text-sm opacity-90">
            Your deposit generates TWO separate yield streams: one subsidizes community loans,
            the other funds public goods. Meanwhile, your treasury maintains perfect 1:1 value with DAI.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DualYieldFlow;

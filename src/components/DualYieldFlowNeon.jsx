import { TrendingUp, Users, ArrowRight, DollarSign, Gift, Zap } from 'lucide-react';

const DualYieldFlowNeon = ({ dsrYield, morphoInterest, debtRepaid, dsrApy = '5.0', morphoApy = '3.0' }) => {
  const totalYield = parseFloat(dsrYield) + parseFloat(morphoInterest);
  const dsrPercentage = totalYield > 0 ? ((parseFloat(dsrYield) / totalYield) * 100).toFixed(1) : 0;
  const morphoPercentage = totalYield > 0 ? ((parseFloat(morphoInterest) / totalYield) * 100).toFixed(1) : 0;

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border-2 border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.2)] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Zap className="w-7 h-7 text-cyan-400" />
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            THE WINNING TWIST
          </span>
        </h3>
      </div>

      <p className="text-gray-300 mb-8 text-center">Dual-Yield Mechanism: One Deposit, Two Impact Streams</p>

      {/* Flow Diagram */}
      <div className="space-y-8">
        {/* Source */}
        <div className="flex items-center justify-center">
          <div className="bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl p-6 text-white text-center shadow-[0_0_30px_rgba(34,211,238,0.5)] border-2 border-cyan-400/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
            <DollarSign className="w-10 h-10 mx-auto mb-3 relative z-10" />
            <p className="font-bold text-xl uppercase tracking-wider relative z-10">Your DAI Deposit</p>
            <p className="text-sm opacity-90 mt-1 relative z-10">Earning dual yields simultaneously</p>
          </div>
        </div>

        {/* Split Arrow with animation */}
        <div className="flex items-center justify-center relative">
          <div className="flex space-x-3">
            <div className="w-1 h-16 bg-gradient-to-b from-purple-500 to-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"></div>
            <div className="w-1 h-16 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse" style={{animationDelay: '0.5s'}}></div>
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 px-3 py-1 rounded-full border-2 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            <span className="text-xs font-bold text-purple-300 uppercase">SPLIT</span>
          </div>
        </div>

        {/* Yield Streams */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Primary Yield: DSR */}
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border-2 border-green-500/40 shadow-[0_0_25px_rgba(34,197,94,0.3)] relative overflow-hidden hover:border-green-400/60 hover:shadow-[0_0_35px_rgba(34,197,94,0.5)] transition-all">
            {/* Animated glow effect */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/20 rounded-full blur-2xl animate-pulse"></div>

            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <h4 className="font-bold text-green-300 uppercase tracking-wider">Primary Yield</h4>
              </div>

              <div className="mb-4">
                <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                  {dsrApy}% APY
                </p>
                <p className="text-sm font-medium text-green-300">DSR from sDAI</p>
              </div>

              <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 mb-4 border border-green-500/30">
                <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">Accumulated Yield:</p>
                <p className="text-2xl font-bold text-green-400">{parseFloat(dsrYield).toFixed(6)} DAI</p>
              </div>

              <div className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl p-4 mb-4 shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                <ArrowRight className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Auto-Repays Community Loans</span>
              </div>

              <div className="bg-green-900/20 rounded-lg p-3 border border-green-500/20">
                <p className="text-xs text-green-300">
                  <span className="font-bold">{parseFloat(debtRepaid).toFixed(6)} DAI</span> repaid so far
                </p>
              </div>

              <div className="mt-3 flex items-center justify-center">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                <span className="text-xs text-gray-400 ml-2">ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Secondary Yield: Morpho */}
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border-2 border-blue-500/40 shadow-[0_0_25px_rgba(59,130,246,0.3)] relative overflow-hidden hover:border-blue-400/60 hover:shadow-[0_0_35px_rgba(59,130,246,0.5)] transition-all">
            {/* Animated glow effect */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>

            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-4">
                <Gift className="w-6 h-6 text-blue-400" />
                <h4 className="font-bold text-blue-300 uppercase tracking-wider">Secondary Yield</h4>
              </div>

              <div className="mb-4">
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
                  {morphoApy}% APY
                </p>
                <p className="text-sm font-medium text-blue-300">Morpho Lending Interest</p>
              </div>

              <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 mb-4 border border-blue-500/30">
                <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">Accumulated Interest:</p>
                <p className="text-2xl font-bold text-blue-400">{parseFloat(morphoInterest).toFixed(6)} DAI</p>
              </div>

              <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-4 mb-4 shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                <ArrowRight className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Donated to Public Goods</span>
              </div>

              <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/20">
                <p className="text-xs text-blue-300">
                  Funding <span className="font-bold">Octant</span> public goods continuously
                </p>
              </div>

              <div className="mt-3 flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                <span className="text-xs text-gray-400 ml-2">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Innovation Highlight */}
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-xl rounded-2xl p-6 border-2 border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.2)]">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-purple-300 mb-2 uppercase tracking-wider">🎯 The "Buy-One-Get-One" Innovation</h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                Your deposit maintains <span className="text-cyan-400 font-bold">perfect 1:1 DAI peg</span> for treasury stability,
                while simultaneously generating <span className="text-green-400 font-bold">DSR yield</span> for community loan repayments
                AND <span className="text-blue-400 font-bold">Morpho interest</span> for public goods funding.
                <span className="block mt-2 text-purple-300 font-semibold">One deposit. Two yield streams. Zero compromise.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DualYieldFlowNeon;

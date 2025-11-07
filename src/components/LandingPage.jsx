import { useState } from 'react';
import { ArrowRight, TrendingUp, Users, Gift, Shield, Zap, CheckCircle, Github, Twitter, ExternalLink } from 'lucide-react';
import LogoImg from '../assets/Logo.png';
import HomeImg from '../assets/Home.png';
import ChartImg from '../assets/Chart.png';
import SecondImg from '../assets/Second.png';
import TestsImg from '../assets/Tests_passing.png';

const LandingPage = ({ onLaunchApp }) => {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Dual-Yield Mechanism",
      description: "One deposit generates two separate yield streams - maximizing social impact",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Auto-Repaying Loans",
      description: "DSR yield automatically repays community member loans - zero manual payments",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: <Gift className="w-8 h-8" />,
      title: "Public Goods Funding",
      description: "Morpho lending interest continuously funds Octant public goods projects",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "1:1 DAI Peg",
      description: "Treasury depositors maintain perfect 1:1 value - no impermanent loss",
      color: "from-amber-500 to-orange-600"
    }
  ];

  const stats = [
    { label: "Chains Supported", value: "Ethereum" },
    { label: "Built On", value: "Yearn V3" },
    { label: "Protocols", value: "Spark + Morpho" },
    { label: "Status", value: "Testnet Live" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Navigation */}
        <nav className="relative z-10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={LogoImg} alt="Ambit Logo" className="h-12 w-12 rounded-xl shadow-lg" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Ambit
                </h1>
                <p className="text-xs text-gray-600">Auto-Repaying Public Goods Loans</p>
              </div>
            </div>
            <button
              onClick={onLaunchApp}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center space-x-2"
            >
              <span>Launch App</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block mb-4 px-4 py-2 bg-indigo-100 rounded-full">
              <span className="text-sm font-semibold text-indigo-700">🏆 Built for Octant DeFi Hackathon</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              The{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                "Buy-One-Get-One"
              </span>{' '}
              for DAOs
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Fund public goods while providing auto-repaying loans to your community.
              <span className="block mt-2 text-indigo-600 font-semibold">
                One deposit. Two social impact streams. Zero compromise.
              </span>
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={onLaunchApp}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all flex items-center space-x-2"
              >
                <Zap className="w-5 h-5" />
                <span>Launch App</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="https://github.com/SuyashAlphaC/Ambit-Double-Duty-Loans-Protocol"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center space-x-2 border-2 border-gray-200"
              >
                <Github className="w-5 h-5" />
                <span>View Code</span>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10 rounded-2xl shadow-2xl overflow-hidden border-4 border-white">
              <img src={HomeImg} alt="Ambit Dashboard" className="w-full" />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-gray-900 mb-4">
            The Winning Twist
          </h3>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ambit splits a single DAI deposit into two yield streams, creating unprecedented social impact
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
              className={`bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-transparent hover:shadow-2xl transform hover:scale-105 transition-all cursor-pointer ${
                hoveredFeature === index ? 'ring-4 ring-purple-200' : ''
              }`}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg`}>
                {feature.icon}
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h4>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Screenshot Gallery */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-4 shadow-xl border-2 border-gray-200">
            <img src={ChartImg} alt="Yield Analytics" className="w-full rounded-lg" />
            <p className="text-sm font-semibold text-gray-900 mt-3 text-center">Real-time Yield Analytics</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-xl border-2 border-gray-200">
            <img src={SecondImg} alt="Community Dashboard" className="w-full rounded-lg" />
            <p className="text-sm font-semibold text-gray-900 mt-3 text-center">Community Borrower Dashboard</p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-600 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              How Ambit Works
            </h3>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Simple for users, sophisticated under the hood
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Deposit DAI",
                description: "DAO treasury deposits DAI into Ambit vault, maintains 1:1 peg"
              },
              {
                step: "2",
                title: "Earn DSR",
                description: "DAI converts to sDAI, earning Dai Savings Rate (~5% APY)"
              },
              {
                step: "3",
                title: "Auto-Repay Loans",
                description: "DSR yield automatically repays whitelisted community member loans"
              },
              {
                step: "4",
                title: "Fund Public Goods",
                description: "Morpho lending interest donates to Octant public goods projects"
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 border-white/20 hover:bg-white/20 transition-all">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold text-xl mb-4 shadow-lg">
                    {item.step}
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-purple-100">{item.description}</p>
                </div>
                {index < 3 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-white/50 w-8 h-8" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-4xl font-bold text-gray-900 mb-6">
              Why Ambit?
            </h3>
            <div className="space-y-4">
              {[
                "Treasury stays liquid with 1:1 DAI peg",
                "Community members get interest-free loans",
                "Public goods receive continuous funding",
                "Fully on-chain and transparent",
                "Built on battle-tested protocols (Yearn V3, Spark, Morpho)",
                "Zero additional governance overhead"
              ].map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-lg text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200">
              <p className="text-sm font-bold text-amber-900 mb-2">🎯 Perfect For:</p>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• DAOs with treasuries seeking social impact</li>
                <li>• Communities wanting to provide member loans</li>
                <li>• Organizations funding public goods</li>
                <li>• Protocols exploring innovative yield strategies</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-2xl border-2 border-gray-200">
            <img src={TestsImg} alt="All Tests Passing" className="w-full rounded-lg mb-4" />
            <div className="text-center">
              <p className="text-sm font-bold text-green-600 mb-2">✅ All Tests Passing</p>
              <p className="text-xs text-gray-600">
                Comprehensive test suite covering all yield splitting scenarios
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Create Dual Impact?
          </h3>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join the future of socially-conscious DeFi. One deposit, two yield streams, unlimited social good.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={onLaunchApp}
              className="bg-white text-purple-600 px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all flex items-center space-x-2"
            >
              <Zap className="w-5 h-5" />
              <span>Launch App Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="https://github.com/SuyashAlphaC/Ambit-Double-Duty-Loans-Protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent text-white border-2 border-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all flex items-center space-x-2"
            >
              <Github className="w-5 h-5" />
              <span>Documentation</span>
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src={LogoImg} alt="Ambit" className="h-8 w-8 rounded-lg" />
                <span className="font-bold text-lg">Ambit</span>
              </div>
              <p className="text-sm text-gray-400">
                Auto-repaying public goods loan strategy for DAOs
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={onLaunchApp} className="hover:text-white transition-colors">Launch App</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Whitepaper</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Community</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors flex items-center space-x-1"><Twitter className="w-4 h-4" /><span>Twitter</span></a></li>
                <li><a href="#" className="hover:text-white transition-colors flex items-center space-x-1"><Github className="w-4 h-4" /><span>GitHub</span></a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Built With</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Yearn V3 TokenizedStrategy</li>
                <li>Spark Protocol (DSR)</li>
                <li>Morpho Blue</li>
                <li>Octant</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>Built for the Octant DeFi Hackathon • Powered by Spark Protocol, Morpho Blue, and Octant</p>
            <p className="mt-2">© 2024 Ambit Protocol. Open source under MIT License.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

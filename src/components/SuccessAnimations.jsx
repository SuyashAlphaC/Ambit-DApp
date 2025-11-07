import React, { useState, useEffect } from 'react';
import { CheckCircle, TrendingUp, Zap, Sparkles, Gift } from 'lucide-react';

// Success Checkmark Animation
export const SuccessCheckmark = ({ size = "md", onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  if (!visible) return null;

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24"
  };

  return (
    <div className={`${sizeClasses[size]} relative animate-scale-in`}>
      {/* Outer ring pulse */}
      <div className="absolute inset-0 rounded-full bg-green-500/30 animate-ping"></div>

      {/* Success circle */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 shadow-[0_0_30px_rgba(34,197,94,0.6)] flex items-center justify-center">
        <CheckCircle className="w-3/5 h-3/5 text-white animate-check-draw" />
      </div>
    </div>
  );
};

// Confetti Animation
export const Confetti = ({ duration = 3000 }) => {
  const [particles, setParticles] = useState([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Generate random confetti particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 500,
      color: ['#22d3ee', '#a855f7', '#ec4899', '#22c55e', '#fbbf24'][Math.floor(Math.random() * 5)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute top-0 animate-confetti-fall"
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}ms`,
            animationDuration: `${2000 + Math.random() * 1000}ms`,
          }}
        >
          <div
            className="rounded-sm"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              transform: `rotate(${particle.rotation}deg)`,
            }}
          />
        </div>
      ))}
    </div>
  );
};

// Success Toast Notification
export const SuccessToast = ({ message, txHash, explorerUrl, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="bg-gray-800/95 backdrop-blur-xl border-2 border-green-500/50 rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.4)] p-4 max-w-md">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.5)]">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="flex-1">
            <p className="text-sm font-bold text-green-300 uppercase tracking-wider mb-1">
              Success!
            </p>
            <p className="text-sm text-gray-300">{message}</p>

            {txHash && explorerUrl && (
              <a
                href={`${explorerUrl}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 mt-2 font-medium"
              >
                <span>View transaction</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>

          <button
            onClick={() => {
              setVisible(false);
              if (onClose) onClose();
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Yield Generated Animation
export const YieldGeneratedAnimation = ({ amount, type = "dsr", onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  const colors = {
    dsr: {
      from: "from-green-400",
      to: "to-cyan-400",
      icon: TrendingUp,
      label: "DSR Yield"
    },
    morpho: {
      from: "from-blue-400",
      to: "to-purple-400",
      icon: Gift,
      label: "Morpho Interest"
    }
  };

  const config = colors[type];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="animate-fade-in-scale">
        <div className="relative">
          {/* Glowing background */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-2xl blur-3xl animate-pulse"></div>

          {/* Main card */}
          <div className={`relative bg-gray-800/90 backdrop-blur-xl border-2 border-${type === 'dsr' ? 'green' : 'blue'}-500/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(34,211,238,0.4)]`}>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.6)] animate-bounce-slow">
                <Icon className="w-10 h-10 text-white" />
              </div>

              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                {config.label} Generated
              </p>

              <p className={`text-4xl font-bold bg-gradient-to-r ${config.from} ${config.to} bg-clip-text text-transparent mb-2`}>
                +{amount} DAI
              </p>

              <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span>Funding {type === 'dsr' ? 'Community Loans' : 'Public Goods'}</span>
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Transaction Success Modal
export const TransactionSuccessModal = ({
  title = "Transaction Successful!",
  message,
  txHash,
  explorerUrl,
  showConfetti = true,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
      {showConfetti && <Confetti duration={3000} />}

      <div className="bg-gray-800/95 backdrop-blur-xl rounded-2xl p-8 border-2 border-green-500/50 shadow-[0_0_40px_rgba(34,197,94,0.4)] max-w-md mx-4 animate-scale-in">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-green-500/30 animate-ping"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 shadow-[0_0_30px_rgba(34,197,94,0.6)] flex items-center justify-center">
              <CheckCircle className="w-14 h-14 text-white" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-4 uppercase tracking-wider">
            {title}
          </h3>

          {/* Message */}
          {message && (
            <p className="text-gray-300 mb-6">{message}</p>
          )}

          {/* Transaction Hash */}
          {txHash && (
            <div className="mb-6 p-4 bg-gray-900/60 rounded-lg border border-green-500/30">
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Transaction Hash:</p>
              <p className="text-xs font-mono text-green-400 break-all">{txHash}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {txHash && explorerUrl && (
              <a
                href={`${explorerUrl}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all uppercase tracking-wider border-2 border-cyan-400/30 flex items-center justify-center space-x-2"
              >
                <span>View on Explorer</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}

            <button
              onClick={onClose}
              className="flex-1 bg-gray-700/50 text-gray-300 px-6 py-3 rounded-lg font-bold hover:bg-gray-700 transition-all uppercase tracking-wider border-2 border-gray-600/30"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default {
  SuccessCheckmark,
  Confetti,
  SuccessToast,
  YieldGeneratedAnimation,
  TransactionSuccessModal
};

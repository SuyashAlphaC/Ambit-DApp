# Ambit Frontend: Double Duty Yield Interface

![Ambit Logo](../Ambit/Image%20Gallery/Logo.png)

A modern, neon-themed web interface for the Ambit Protocol - an auto-repaying public goods loan strategy built for the Octant DeFi Hackathon.

---

## Table of Contents

1. [Overview](#overview)
2. [High-Level Concept](#high-level-concept)
3. [Frontend Architecture](#frontend-architecture)
4. [Quick Start Guide](#quick-start-guide)
5. [Core Features](#core-features)
6. [Smart Contract Integration](#smart-contract-integration)
7. [Protocol Architecture](#protocol-architecture)
8. [Technical Stack](#technical-stack)

---

## Overview

![Home Screen](../Ambit/Image%20Gallery/Home.png)

The Ambit Frontend is a React-based decentralized application (dApp) that provides an intuitive interface for interacting with the Ambit Protocol smart contracts. It enables DAOs and users to deposit DAI, track dual-yield generation, manage community borrowers, and monitor public goods funding in real-time.

---

## High-Level Concept: The "Buy-One-Get-One" for DAOs

This project implements the **"Auto-Repaying Public Goods Loan"** strategy, a sophisticated, dual-benefit system built for the Octant `YieldDonatingStrategy` framework.

It's designed for a DAO treasury (or any user) to deposit a base asset like DAI and achieve two goals simultaneously, creating a "buy-one-get-one" for public goods:

1.  **Fund Public Goods:** It generates yield from lending interest and donates 100% of it to the Octant public goods fund (the `dragonRouter`).
2.  **Provide a Community Service:** It uses a *separate, primary* yield source (Spark's sDAI) to automatically pay down the loan principals for a whitelist of community members.

The DAO's treasury itself remains 1:1 pegged to their deposit, as all generated yield is "donated" in one of these two ways.

---

## Frontend Architecture

### Technology Stack

- **React 18.2** - Modern UI framework with hooks
- **Vite 5.0** - Lightning-fast build tool and dev server
- **Ethers.js 6.15** - Ethereum library for blockchain interactions
- **Tailwind CSS 3.4** - Utility-first CSS framework with custom neon theme
- **Lucide React** - Beautiful, consistent icon system

### Design System

The frontend features a custom **neon cyberpunk theme** with:
- Gradient color schemes (cyan, purple, pink)
- Glassmorphism effects with backdrop blur
- Animated glow effects and shadows
- Responsive layout for all screen sizes
- Smooth transitions and hover states

### Component Structure

```
src/
├── components/
│   ├── LandingPage.jsx              # Initial landing page
│   ├── DualYieldFlowNeon.jsx        # Dual-yield visualization
│   ├── PublicGoodsTrackerNeon.jsx   # Public goods impact tracker
│   ├── HarvestButton.jsx            # Yield harvesting interface
│   ├── CommunityBorrowerDashboard.jsx # Borrower management
│   ├── LoadingSkeletons.jsx         # Loading states
│   └── SuccessAnimations.jsx        # Transaction success UI
├── config/
│   └── contracts.js                 # Contract addresses & ABIs
└── App.jsx                          # Main application component
```

---

## Quick Start Guide

### Prerequisites

- Node.js v18+ and npm/yarn
- MetaMask or compatible Web3 wallet
- Access to Ethereum Mainnet (or Tenderly fork for testing)

### Installation

1. **Clone the repository:**
   ```bash
   cd ambit-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure contract addresses:**

   Edit `src/config/contracts.js` with your deployed contract addresses:
   ```javascript
   export const CONTRACTS = {
     VAULT: '0xYourVaultAddress',
     STRATEGY: '0xYourStrategyAddress',
     DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
     // ... other addresses
   };
   ```

4. **Start development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser:**

   Navigate to `http://localhost:5173` (default Vite port)

6. **Connect your wallet:**

   Click "CONNECT WALLET" and approve the connection in MetaMask

### Production Build

```bash
npm run build
# or
yarn build
```

The production-ready files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
# or
yarn preview
```

---

## Core Features

### 1. DAO Treasury Dashboard

![Second View](../Ambit/Image%20Gallery/Second.png)

**Features:**
- Deposit DAI into the strategy
- Withdraw DAI with 1:1 redemption guarantee
- View total vault assets and your position
- Track health factor and LTV ratio
- Real-time DSR APY and Morpho APY display

**Key Stats:**
- Your Position (DAI value + shares)
- Total Vault Assets (1:1 DAI peg maintained)
- Community Debt Repaid (auto-repayment tracking)
- Health Factor (position safety indicator)

### 2. Dual-Yield Flow Visualization

**Interactive Display:**
- **Primary Yield (DSR):** Shows DAI → sDAI → Auto-Repayment flow
- **Secondary Yield (Morpho):** Shows Community Interest → Public Goods flow
- Real-time APY calculations
- Animated yield accumulation

### 3. Harvest & Report

**One-Click Yield Processing:**
- Claims DSR yield from sDAI appreciation
- Auto-repays community borrowers' debts proportionally
- Collects Morpho lending interest
- Donates interest to Octant public goods fund
- Updates all tracking metrics

### 4. Community Borrower Dashboard

**For Community Members:**
- View your borrowing capacity
- Deposit collateral (sDAI)
- Borrow DAI against collateral
- Track debt that's being auto-repaid
- Monitor your position health

**Dashboard Metrics:**
- Current Debt (outstanding borrow amount)
- Debt Repaid by Treasury (via DSR yield)
- Available to Borrow (based on collateral)
- Collateral Value (in DAI)
- Position Health Factor

### 5. Public Goods Tracker

**Impact Visualization:**
- Total amount donated to public goods
- Number of active community borrowers
- Community members helped
- Donation flow animation

### 6. Smart Contract Information

**Transparency Section:**
- Vault contract address with explorer link
- Strategy contract address with explorer link
- Network information
- "How It Works" educational panel

---

## Smart Contract Integration

### Contract Interactions

The frontend integrates with the following smart contracts:

#### 1. **YieldDonatingStrategy (Vault)**
```javascript
// Deposit DAI
await vaultContract.deposit(amount, userAddress);

// Withdraw DAI
await vaultContract.redeem(shares, userAddress, userAddress);

// Check balances
await vaultContract.balanceOf(userAddress);
await vaultContract.convertToAssets(shares);
```

#### 2. **Strategy Functions**
```javascript
// Harvest and report yield
await strategyContract.report();

// View estimated assets
await strategyContract.estimatedTotalAssets();

// Check health factor
await strategyContract.healthFactor();

// Get community borrower info
await strategyContract.getBorrowerInfo(borrowerAddress);
```

#### 3. **Morpho Blue Integration**
```javascript
// Supply collateral (for borrowers)
await morphoContract.supplyCollateral(marketParams, assets, onBehalf, data);

// Borrow DAI (for borrowers)
await morphoContract.borrow(marketParams, assets, shares, onBehalf, receiver);

// Check position
await morphoContract.position(marketId, userAddress);
```

### Configuration

The `src/config/contracts.js` file contains:

- **Contract Addresses:** All deployed contract addresses
- **ABIs:** Complete ABIs for all interactions
- **Network Config:** Chain ID, RPC URL, block explorer
- **Market Parameters:** Morpho Blue market configuration

### Error Handling

The frontend includes comprehensive error handling:
- Network connection issues
- Transaction failures
- Insufficient balances
- Contract not deployed warnings
- User-friendly error messages

---

## Protocol Architecture

![Architecture Chart](../Ambit/Image%20Gallery/Chart.png)

### The "Winning Twist": Dual-Yield Mechanism

#### Step 1: `_deployFunds()` - Building the Engine

When a DAO deposits DAI:

1.  **Earn Base Yield:** 100% of DAI → Spark Protocol → sDAI (earning DSR)
2.  **Provide Collateral:** sDAI → Morpho Blue collateral
3.  **Borrow (Create Liquidity):** Borrow DAI against sDAI (50% LTV)
4.  **Create Lending Pool:** Supply borrowed DAI to Morpho for community borrowing

**Result:**
* Earning **DSR (Yield 1)** on sDAI collateral
* Earning **Morpho lending interest (Yield 2)** on DAI supply
* Community can borrow from the lending pool

#### Step 2: `_harvestAndReport()` - Dual-Yield Distribution

**Primary Yield (DSR) → Auto-Repayment:**
1. Calculate DSR profit from sDAI appreciation
2. Withdraw profit as DAI
3. Calculate total community debt across all borrowers
4. Distribute repayments proportionally to each borrower
5. Auto-repay debts using Morpho's `onBehalf` parameter

**Secondary Yield (Morpho Interest) → Public Goods:**
1. Calculate lending interest from community borrows
2. Withdraw interest from Morpho supply
3. Transfer 100% to Octant dragonRouter
4. Emit donation event

**The 1:1 Peg:**
- Returns `oldTotalAssets` to maintain 1:1 DAI peg
- DAO treasury value stays constant
- All yield redirected to community + public goods

#### Step 3: Withdrawal Logic

**Proportional Unwinding:**
1. Calculate withdrawal ratio based on net vault value
2. Withdraw proportional DAI from Morpho supply
3. Repay proportional vault debt to Morpho
4. Withdraw proportional sDAI collateral
5. Redeem sDAI for DAI
6. Return DAI to user

**Safety Features:**
- ~1200 wei collateral dust left for safety (prevents reverts)
- Health factor monitoring
- Emergency shutdown capability

---

## Technical Stack

### Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "ethers": "^6.15.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "vite": "^5.0.8",
    "@vitejs/plugin-react": "^4.2.1",
    "tailwindcss": "^3.4.18",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6"
  }
}
```

### Smart Contract Stack

- **Solidity 0.8.25** - Smart contract language
- **Foundry** - Development framework and testing
- **Octant TokenizedStrategy** - Yield donation framework
- **Spark Protocol (sDAI)** - DSR yield source
- **Morpho Blue** - Lending protocol for liquidity
- **OpenZeppelin** - Security and ERC20 standards

### Network Support

- **Ethereum Mainnet** - Production deployment
- **Tenderly Fork** - Development and testing
- **Future:** Additional EVM-compatible chains

---

## Development Workflow

### Hot Module Replacement (HMR)

Vite provides instant feedback during development:
- Save changes and see updates immediately
- State preservation across reloads
- Fast error recovery

### Testing Integration

Connect to a Tenderly fork for testing:

1. Update `src/config/contracts.js` with fork URL
2. Connect MetaMask to the fork network
3. Test transactions without spending real ETH

### Smart Contract Updates

When contracts are updated:

1. Update ABIs in `src/config/contracts.js`
2. Update contract addresses if redeployed
3. Test all interactions in development
4. Build and deploy frontend

---

## Key Features Explained

### 1. Real-Time Data Loading

The app loads data on wallet connection and after every transaction:
- User balances (DAI, shares, share value)
- Strategy stats (total assets, health factor, debt repaid)
- Yield calculations (DSR yield, Morpho interest)
- APY rates (from sDAI and Morpho contracts)

### 2. Transaction Flow

Every transaction follows this pattern:
1. User initiates action (deposit/withdraw/harvest)
2. Check and approve tokens if needed
3. Execute transaction
4. Show loading state with tx hash
5. Wait for confirmation
6. Show success animation with confetti
7. Reload all data to reflect new state

### 3. Error Handling

User-friendly error messages for:
- Wallet not connected
- Wrong network
- Insufficient balance
- Transaction failures
- Contract call failures

### 4. Loading States

Skeleton screens during data loading:
- Stats cards skeletons
- Dual-yield flow skeleton
- Public goods tracker skeleton
- Harvest button skeleton
- Community dashboard skeleton

---

## Security Considerations

### Frontend Security

- No private keys stored in frontend
- All transactions signed by user wallet
- Input validation before contract calls
- Safe math for all calculations
- Approval checks before token transfers

### Contract Security

- 1:1 DAI peg maintained (no profit reported to strategy)
- ~1200 wei dust tolerance for safe withdrawals
- Health factor monitoring
- Emergency shutdown capability
- Proportional unwinding on withdrawals

---

## Troubleshooting

### Common Issues

**Issue:** "Please install MetaMask" error
- **Solution:** Install MetaMask browser extension

**Issue:** "Wrong network" error
- **Solution:** Switch to Ethereum Mainnet or Tenderly fork network

**Issue:** Transaction fails with "Insufficient funds"
- **Solution:** Ensure you have enough DAI and ETH for gas

**Issue:** "Contract not deployed" error
- **Solution:** Verify contract addresses in `config/contracts.js`

**Issue:** Data not loading
- **Solution:** Check RPC connection and refresh the page

---

## Contributing

This project was built for the Octant DeFi Hackathon. Contributions are welcome!

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style

- React functional components with hooks
- ESLint for code quality
- Tailwind CSS for styling
- Clear comments for complex logic

---

## Links & Resources

- **Smart Contracts:** `../Ambit/` directory
- **Octant Protocol:** [octant.build](https://octant.build)
- **Morpho Blue:** [morpho.org](https://morpho.org)
- **Spark Protocol:** [spark.fi](https://spark.fi)

---

## License

MIT License - Built for the Octant DeFi Hackathon

---

## Acknowledgments

- **Octant Team** - For the YieldDonatingStrategy framework
- **Morpho Blue** - For the isolated lending markets
- **Spark Protocol** - For sDAI and DSR yield
- **Yearn Finance** - For TokenizedStrategy patterns

---

Built with ❤️ for the Octant DeFi Hackathon

import YieldDonatingStrategyABI from '../abis/YieldDonatingStrategy.json';
import YieldDonatingTokenizedStrategyABI from '../abis/YieldDonatingTokenizedStrategy.json';
import TokenizedStrategyABI from '../abis/TokenizedStrategy.json';
import YieldDonatingVaultABI from '../abis/YieldDonatingVault.json'; // Combined ABI with vault + strategy functions
import ERC20ABI from '../abis/ERC20.json';
import ERC4626ABI from '../abis/ERC4626.json';

export const CONTRACTS = {
  VAULT: "0x2AD1E3C334C26ac982F020E0247F394f003F88c0",

  STRATEGY: "0x2AD1E3C334C26ac982F020E0247F394f003F88c0",

  IMPLEMENTATION: "0x0c206D827190935e886D0e921E72490E212432a4",

  DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  SDAI: "0x83F20F44975D03b1b09e64809B757c47f942BEeA",
  MORPHO_BLUE: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb"
};

// ABIs Export
export const ABIS = {
  YieldDonatingStrategy: YieldDonatingStrategyABI,
  YieldDonatingTokenizedStrategy: YieldDonatingTokenizedStrategyABI,
  TokenizedStrategy: TokenizedStrategyABI,
  YieldDonatingVault: YieldDonatingVaultABI, 
  ERC20: ERC20ABI,
  ERC4626: ERC4626ABI
};

export const NETWORK = {
  chainId: '0x8', 
  chainName: 'Tenderly (octant-hackathon-mainnet-fork)',
  rpcUrl: 'https://virtual.mainnet.eu.rpc.tenderly.co/82c86106-662e-4d7f-a974-c311987358ff',
  blockExplorerUrl: 'https://dashboard.tenderly.co/explorer/fork/82c86106-662e-4d7f-a974-c311987358ff',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  }
};

export const MORPHO_MARKET_PARAMS = {
  marketId: "0xb1eac1c0f3ad13fb45b01beac8458c055c903b1bff8cb882346635996a774f77",
  loanToken: CONTRACTS.DAI,
  collateralToken: CONTRACTS.SDAI,
  oracle: "0x9d4eb56E054e4bFE961F861E351F606987784B65",
  irm: "0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC",
  lltv: "980000000000000000" // 98% LLTV
};

export default CONTRACTS;
// Human-readable network labels
export const NETWORK_LABELS: Record<string, string> = {
  // Mainnet chains
  btc: 'Bitcoin',
  eth: 'Ethereum',
  trx: 'Tron',
  bsc: 'BNB Chain',
  sol: 'Solana',
  matic: 'Polygon',
  avax: 'Avalanche',
  arb: 'Arbitrum',
  op: 'Optimism',
  base: 'Base',
  fantom: 'Fantom',
  celo: 'Celo',
  xlm: 'Stellar',
  xrp: 'XRP',
  ltc: 'Litecoin',
  doge: 'Dogecoin',
  ada: 'Cardano',
  dot: 'Polkadot',
  atom: 'Cosmos',
  near: 'NEAR',
  algo: 'Algorand',
  xtz: 'Tezos',
  eos: 'EOS',
  xmr: 'Monero',
  bch: 'Bitcoin Cash',
  etc: 'Ethereum Classic',
  fil: 'Filecoin',
  hbar: 'Hedera',
  icp: 'Internet Computer',
  vet: 'VeChain',
  apt: 'Aptos',
  sui: 'Sui',
  sei: 'Sei',
  inj: 'Injective',
  zksync: 'zkSync Era',
  linea: 'Linea',
  scroll: 'Scroll',
  manta: 'Manta',
  mantle: 'Mantle',
  blast: 'Blast',
  mode: 'Mode',
  ton: 'TON',
  mainnet: 'Mainnet',
};

// Custody-supported networks (for highlighting)
export const CUSTODY_SUPPORTED_NETWORKS = ['btc', 'eth', 'trx'];

/**
 * Get human-readable network label
 */
export function getNetworkLabel(network: string): string {
  const lower = network.toLowerCase();
  return NETWORK_LABELS[lower] || network.toUpperCase();
}

/**
 * Check if network is custody-supported
 */
export function isCustodySupported(network: string): boolean {
  return CUSTODY_SUPPORTED_NETWORKS.includes(network.toLowerCase());
}

// Filter options for status
export const statusOptions = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

// Filter options for visibility
export const visibilityOptions = [
  { value: 'true', label: 'Visible' },
  { value: 'false', label: 'Hidden' },
];

// Filter options for features
export const featureOptions = [
  { value: 'true', label: 'Enabled' },
  { value: 'false', label: 'Disabled' },
];

// Platform options
export const platformOptions = [
  { value: 'web', label: 'Web' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'telegram', label: 'Telegram' },
];

export interface NetworkOption {
  value: string;
  label: string;
  isCustodySupported: boolean;
}

/**
 * Convert network list to options with labels
 */
export function getNetworkOptions(networks: string[]): NetworkOption[] {
  return networks
    .map((network) => ({
      value: network,
      label: getNetworkLabel(network),
      isCustodySupported: isCustodySupported(network),
    }))
    .sort((a, b) => {
      // Sort custody-supported first, then alphabetically
      if (a.isCustodySupported !== b.isCustodySupported) {
        return a.isCustodySupported ? -1 : 1;
      }
      return a.label.localeCompare(b.label);
    });
}

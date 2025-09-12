# Hyperlane Proxy Upgrade Demo

This repository demonstrates how to upgrade Hyperlane proxy contracts.

## Getting Started

### 1. Deploy HypERC20 Contract (Skip to Step 2 if Already Deployed)

Deploy the HypERC20 contract using the Hyperlane CLI:

```bash
hyperlane warp deploy
```

### Example Warp Configuration

Below is an example warp configuration file:

```yaml
pruvtest:
  interchainSecurityModule:
    domains: {}
    owner: "0x88b90d085dAf288C295bD3A6057B086BEA1C95e9"
    type: defaultFallbackRoutingIsm
  isNft: false
  owner: "0x88b90d085dAf288C295bD3A6057B086BEA1C95e9"
  proxyAdmin:
    address: "0x823B2406490752fB50e1CABa809Bf643CD233553"
    owner: "0x88b90d085dAf288C295bD3A6057B086BEA1C95e9"
  token: "0x3909c14120016b027A91B2E3AFA0c73F48695ac7"
  type: collateral
  feeCollector: "0xC307Beea4d946DB82c10d35044E486eB11A294c2"
sepolia:
  interchainSecurityModule:
    domains: {}
    owner: "0x88b90d085dAf288C295bD3A6057B086BEA1C95e9"
    type: defaultFallbackRoutingIsm
  isNft: false
  owner: "0x88b90d085dAf288C295bD3A6057B086BEA1C95e9"
  proxyAdmin:
    address: "0x3ab41b17E9C0072571357d774fAEF87D705CD545"
    owner: "0x88b90d085dAf288C295bD3A6057B086BEA1C95e9"
  type: synthetic
```

**Note:** Setting `type: synthetic` will deploy a HypERC20 contract on the specified chain.

After successful deployment, the cli output will be similar to this:

```yaml
tokens:
  - chainName: pruvtest
    standard: EvmHypCollateral
    decimals: 18
    symbol: FREE
    name: FreeERC20
    addressOrDenom: "0x1C705e45A7aa181D66b482FaF37F22fEd696c813"
    collateralAddressOrDenom: "0x3909c14120016b027A91B2E3AFA0c73F48695ac7"
    connections:
      - token: ethereum|sepolia|0x115c870c74f6eabed593b226ad485b89fc5e3798
  - chainName: sepolia
    standard: EvmHypSynthetic
    decimals: 18
    symbol: FREE
    name: FreeERC20
    addressOrDenom: "0x115c870c74f6eabed593b226ad485b89fc5e3798"
    connections:
      - token: ethereum|pruvtest|0x1C705e45A7aa181D66b482FaF37F22fEd696c813
```

### 2. Setup Environment Variables in .env

**PROXY_ADDRESS** = The deployed HypERC20's TransparentUpgradableProxy contract address. Using the example above, the value would be `0x115c870c74f6eabed593b226ad485b89fc5e3798`

**MAILBOX_ADDRESS** = The deployed Hyperlane Mailbox contract address.

**PRIVATE_KEY** = The private key of the deployed proxyAdmin's owner. For the example above, visit https://sepolia.etherscan.io/address/0x3ab41b17E9C0072571357d774fAEF87D705CD545#readContract and click the owner function. The private key corresponds to this owner's public address.

### 3. Run the Upgrade Script

Execute the upgrade script to upgrade your proxy contract:

```bash
yarn upgrade:sepolia
```

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

## Successful Upgrade Proof (Example)

This section demonstrates a complete upgrade workflow with transaction evidence:

1. **Initial Token Creation** (using Hyperlane CLI)  
   Token symbol: FREE  
   [Transaction](https://sepolia.etherscan.io/tx/0x253067a3f5fcc2c7c1171bef075b94987566d17dabeef53390d8c6fb3ff07026)

2. **Add 10 FREE tokens to Account A and B:**
   - [Account A](https://sepolia.etherscan.io/tx/0x9e1e446edf2f7eb6c3c03ba1ab3329725ddfdcbe93d9cd0bd15d4ec62d3cc9ce)
   - [Account B](https://sepolia.etherscan.io/tx/0xa852865891a2c259a3076c756c8f3910b1db2c7f8dc35c3c0f11ee2ecc0f18cb)

3. **Transfer 5 FREE from Account A to Account B:**  
   [Transaction](https://sepolia.etherscan.io/tx/0xdb934b3d37e0f9996b87675714949554f123af62fcb6b1f68b4e59a84c306a3f)

4. **Upgrade Proxy - Whitelist Feature Implemented**  
   [Transaction](https://sepolia.etherscan.io/tx/0xfb91c15284ae96c2f7f8bf8659932960987b3632d755eabb4e249bb5f6f44df0)  
   After this upgrade, only whitelisted accounts can transfer tokens.

5. **Add Account B to Whitelist**  
   [Transaction](https://sepolia.etherscan.io/tx/0x666639790183808cfcd8919762948d22bb8ce397b2412d8cdc3a04a35ced910c)

6. **Successful Transfer from Whitelisted Address** (Account B to Account A)  
   [Transaction](https://sepolia.etherscan.io/tx/0xf4f52294659b77b7d449d7234ee9ecc5773abdc313c4236c434e905a4a817079)

7. **Failed Transfer from Non-Whitelisted Address** (Account A to Account B)  
   [Transaction](https://sepolia.etherscan.io/tx/0xc6a1960002c07f01ae0a7b34796be697711498cf012262275d253b4a7e885edc)  
   This transaction failed with `NOT_WHITELISTED` error, proving the whitelist functionality works correctly.
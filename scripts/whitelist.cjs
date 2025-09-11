const { ethers, upgrades, run } = require("hardhat");

// scripts/deploy-and-verify.cjs
require("dotenv").config();

/** ---------- helpers ---------- **/
const addressToBytes32 = (addr) => ethers.zeroPadValue(addr, 32);
// TokenRouter body: bytes32(recipient) || uint256(amount) || bytes(metadata)
const buildBody = (recipient, amountWei) =>
    ethers.solidityPacked(
        ["bytes32", "uint256", "bytes"],
        [addressToBytes32(recipient), amountWei, "0x"]
    );

async function main() {
    const [signer] = await ethers.getSigners();
    const tokenAddress = "0x6191D475d27c1c210732f09F510169B44E9b6B68";
    const whitelistAddress = '0x620b8D4722D199E3F1947da87BeC67fA71dD41c3';

    const token = await ethers.getContractAt("HypERC20_V2", tokenAddress, signer);

    await token.addWhitelisted(whitelistAddress);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

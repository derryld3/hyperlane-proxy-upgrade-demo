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
    const mailboxAddress = "0x139793231143e25bc73f5E12d40aE951E985451b";
    const receiverAddress = "0x620b8D4722D199E3F1947da87BeC67fA71dD41c3";

    const mailbox = await ethers.getContractAt("TestMailbox", mailboxAddress, signer);
    const token = await ethers.getContractAt("HypERC20", tokenAddress, signer);


    await (await token.enrollRemoteRouter(1, addressToBytes32(signer.address))).wait();

    const hundred = ethers.parseEther("100");
    await (await mailbox.testHandle(
        1, addressToBytes32(signer.address), addressToBytes32(tokenAddress), buildBody(signer.address, hundred)
    )).wait();

    console.log(await token.balanceOf(receiverAddress));

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

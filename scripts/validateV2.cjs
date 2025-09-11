const { ethers, upgrades, run } = require("hardhat");

// scripts/deploy-and-verify.cjs
require("dotenv").config();

async function main() {
    const [signer] = await ethers.getSigners();
    const hypERC20Address = '0x6191D475d27c1c210732f09F510169B44E9b6B68';
    const mailboxAddress = "0x139793231143e25bc73f5E12d40aE951E985451b";

    const hypERC20Impl = await upgrades.erc1967.getImplementationAddress(hypERC20Address);
    await run("verify:verify", {
        address: hypERC20Impl,
        constructorArguments: [18, 1, mailboxAddress],
        contract: "contracts/token/HypERC20_V2.sol:HypERC20_V2",
    });

    const hypERC20Args = [
        [],
    ];
    const hypERC20Iface = new ethers.Interface([
        "function initializeV2(address[])"
    ]);
    const hypERC20InitData = hypERC20Iface.encodeFunctionData("initializeV2", hypERC20Args);
    await run("verify:verify", {
        address: hypERC20Address,
        constructorArguments: [hypERC20Impl, hypERC20InitData],
        contract: "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy",
    });

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

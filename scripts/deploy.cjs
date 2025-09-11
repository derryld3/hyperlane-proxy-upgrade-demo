const { ethers, upgrades, run } = require("hardhat");

// scripts/deploy-and-verify.cjs
require("dotenv").config();

async function main() {
    const [signer] = await ethers.getSigners();

    const TestMailbox = await ethers.getContractFactory("TestMailbox");
    const testMailbox = await TestMailbox.deploy(1);

    await testMailbox.waitForDeployment();
    const testMailboxAddress = await testMailbox.getAddress()

    const HypERC20 = await ethers.getContractFactory("HypERC20");
    const hypERC20 = await upgrades.deployProxy(
        HypERC20,
        [
            0,                  // totalSupply on remote (we'll mint by delivering inbound messages)
            "TestToken",        // name
            "TEST",             // symbol
            ethers.ZeroAddress, // hook
            ethers.ZeroAddress, // ISM
            signer.address       // owner
        ],
        {
            kind: "transparent",
            initializer: "initialize",
            constructorArgs: [18, 1n, testMailboxAddress], // decimals, scale, mailbox
            unsafeAllow: ["constructor", "state-variable-immutable"],
        }
    );

    await hypERC20.waitForDeployment();
    const hypERC20Address = await hypERC20.getAddress()

    const contractAddresses = {
        testMailboxAddress,
        hypERC20Address,
    }

    console.log("Contracts Deployed to: ");
    console.log(contractAddresses);

    await run("verify:verify", {
        address: testMailboxAddress,
        constructorArguments: [1],
        contract: "contracts/test/TestMailbox.sol:TestMailbox",
    });

    const hypERC20Impl = await upgrades.erc1967.getImplementationAddress(hypERC20Address);
    await run("verify:verify", {
        address: hypERC20Impl,
        constructorArguments: [18, 1, testMailboxAddress],
        contract: "contracts/token/HypERC20.sol:HypERC20",
    });

    const hypERC20Args = [
        0,                  // totalSupply on remote (we'll mint by delivering inbound messages)
        "TestToken",        // name
        "TEST",             // symbol
        ethers.ZeroAddress, // hook
        ethers.ZeroAddress, // ISM
        signer.address       // owner
    ];
    const hypERC20Iface = new ethers.Interface([
        "function initialize(uint256,string,string,address,address,address)"
    ]);
    const hypERC20InitData = hypERC20Iface.encodeFunctionData("initialize", hypERC20Args);
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

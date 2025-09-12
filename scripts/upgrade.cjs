const { ethers, upgrades } = require("hardhat");

async function main() {
    const [signer] = await ethers.getSigners();

    const proxyAddress = "0x6191D475d27c1c210732f09F510169B44E9b6B68";
    const mailboxAddress = "0x139793231143e25bc73f5E12d40aE951E985451b";

    const HypERC20 = await ethers.getContractFactory("HypERC20");

    await upgrades.forceImport(proxyAddress, HypERC20, {
        kind: "transparent", // or "uups" if it’s a UUPS proxy
        constructorArgs: [18, 1n, mailboxAddress],
        unsafeAllow: [
            "constructor",
            "state-variable-immutable",
            // add this if your V2 uses reinitializer + _disableInitializers()
            "missing-initializer",
        ],
    });

    // (Optional but recommended) validate the storage layout before upgrading
    const V2 = await ethers.getContractFactory("HypERC20_V2");
    await upgrades.validateUpgrade(proxyAddress, V2, {
        kind: "transparent",                         // or "uups" if that's your proxy
        constructorArgs: [18, 1n, mailboxAddress],   // your impl’s constructor args (immutables)
        unsafeAllow: [
            "constructor",
            "state-variable-immutable",
            "missing-initializer",                     // if your V2 uses reinitializer + _disableInitializers()
        ],
    });

    // Now upgrade + call your reinitializer to set the new value
    const upgraded = await upgrades.upgradeProxy(proxyAddress, V2, {
        kind: "transparent",
        constructorArgs: [18, 1n, mailboxAddress],   // EXACTLY the same as V1
        unsafeAllow: ["constructor", "state-variable-immutable", "missing-initializer",],
        call: { fn: "initializeV2", args: [[]] },
    });

    console.log("Upgraded proxy at:", upgraded.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

const { ethers, upgrades } = require("hardhat")

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised.default);
const expect = chai.expect;

/** ---------- helpers ---------- **/
const addressToBytes32 = (addr) => ethers.zeroPadValue(addr, 32);
// TokenRouter body: bytes32(recipient) || uint256(amount) || bytes(metadata)
const buildBody = (recipient, amountWei) =>
    ethers.solidityPacked(
        ["bytes32", "uint256", "bytes"],
        [addressToBytes32(recipient), amountWei, "0x"]
    );

// Robustly enroll remote router (name varies across Hyperlane versions)
async function enrollRemote(token, domain, routerBytes32) {
    await (await token.enrollRemoteRouter(domain, routerBytes32)).wait();
}

/** ---------- test ---------- **/
describe("HypERC20 upgrade to V2 + whitelist (remote-only)", function () {
    // We'll use ONE chain (remote). Cross-chain sends are simulated.
    const REMOTE_DOMAIN = 1;   // TestMailbox.localDomain
    const ORIGIN_DOMAIN = 100; // dummy "other chain" for inbound messages

    it("HypERC20 Upgradeable test based on deploy and upgrade", async () => {
        const [owner, A, B] = await ethers.getSigners();

        // (1) Deploy TestMailbox (remote chain)
        const TestMailbox = await ethers.getContractFactory("TestMailbox");
        const mailbox = await TestMailbox.deploy(REMOTE_DOMAIN);
        await mailbox.waitForDeployment();

        // (2) Deploy HypERC20 behind a Transparent proxy (V1)
        const HypERC20 = await ethers.getContractFactory("HypERC20");
        const token = await upgrades.deployProxy(
            HypERC20,
            [
                0,                  // totalSupply on remote (we'll mint by delivering inbound messages)
                "TestToken",        // name
                "TEST",             // symbol
                ethers.ZeroAddress, // hook
                ethers.ZeroAddress, // ISM
                owner.address       // owner
            ],
            {
                kind: "transparent",
                initializer: "initialize",
                constructorArgs: [18, 1n, await mailbox.getAddress()], // decimals, scale, mailbox
                unsafeAllow: ["constructor", "state-variable-immutable"],
            }
        );
        await token.waitForDeployment();
        const tokenAddr = await token.getAddress();

        // Enroll "origin router" so inbound messages are accepted in handle()
        await enrollRemote(token, ORIGIN_DOMAIN, addressToBytes32(owner.address));

        // === Bootstrap balances to A:50, B:150 (same as your previous test) ===
        // Mint 100 to A and 100 to B by simulating inbound messages:
        const hundred = ethers.parseEther("100");
        await (await mailbox.testHandle(
            ORIGIN_DOMAIN, addressToBytes32(owner.address), addressToBytes32(tokenAddr), buildBody(A.address, hundred)
        )).wait();
        await (await mailbox.testHandle(
            ORIGIN_DOMAIN, addressToBytes32(owner.address), addressToBytes32(tokenAddr), buildBody(B.address, hundred)
        )).wait();

        // Local transfer: A -> B of 50 (results: A:50, B:150)
        const fifty = ethers.parseEther("50");
        await (await token.connect(A).transfer(B.address, fifty)).wait();

        // Quick sanity
        expect(await token.balanceOf(A.address)).to.equal(hundred - fifty); // 50
        expect(await token.balanceOf(B.address)).to.equal(hundred + fifty); // 150

        // ---------------- 6) Upgrade proxy to V2 ----------------
        const V2 = await ethers.getContractFactory("HypERC20_V2");
        const tokenV2 = await upgrades.upgradeProxy(tokenAddr, V2, {
            kind: "transparent",
            constructorArgs: [18, 1n, await mailbox.getAddress()],   // EXACTLY the same as V1
            unsafeAllow: ["constructor", "state-variable-immutable", "missing-initializer",],
            call: { fn: "initializeV2", args: [[]] },    // or seed initial whitelist here
        });

        // 7) Balances persisted (storage not corrupted)
        expect(await tokenV2.balanceOf(A.address)).to.equal(hundred - fifty); // 50
        expect(await tokenV2.balanceOf(B.address)).to.equal(hundred + fifty); // 150

        // 8) Add B to whitelist
        await (await tokenV2.addWhitelisted(B.address)).wait();
        expect(await tokenV2.isWhitelisted(B.address)).to.equal(true);
        expect(await tokenV2.isWhitelisted(A.address)).to.equal(false);

        // 9) Try remote transfer 50 TEST from A -> B (should FAIL: A not whitelisted)
        await expect(
            tokenV2.connect(A).transfer(B.address, fifty)
        ).to.be.rejectedWith("NOT_WHITELISTED");

        // 10) Remote transfer 50 TEST from B -> A (should SUCCEED: B is whitelisted)
        await tokenV2.connect(B).transfer(A.address, fifty);

        // 11) Final balances: A=100, B=100
        expect(await tokenV2.balanceOf(A.address)).to.equal(hundred);       // 100
        expect(await tokenV2.balanceOf(B.address)).to.equal(hundred);       // 100

        // confirm version() reports 2
        expect(await tokenV2.version()).to.equal(2n);
    });
});

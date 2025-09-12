//TODO


1. deploy and verify TestMailbox.sol(localDomain : 1)
2. deploy and verify HypERC20.sol(decimals: 18, scale: 1, mailbox: DEPLOYED_TESTMAILBOX_ADDRESS, name: TestToken, symbol: TEST), wrap with TransparentUpgradableProxy
3. mint 100 TEST to Address A and B
4. transfer 50 TEST from Address A to B
5. check balanceOf address A and B.should be 50 and 150
6. upgrade HypERC20 to HypERC20_V2
7. check balanceOf address A and B.should be 50 and 150 -> this implies the SC storage is not corrupted
8. add address B to whitelist
9. try transfer 50 TEST from address A to B -> should be failed as A is not whitelisted
10. try transfer 50 TEST from adddress B to A -> must be successful
11. check balanceOf address A and B.should be 100 and 100



import sdk from "./1-initialize-sdk.js";

// This is the address to our ERC-1155 membership NFT contract.
const editionDrop = sdk.getEditionDrop("0x973047353BCa0FcE8a6c75B7dfdC32C6eCAEF9D3");

// This is the address to our ERC-20 token contract.
const token = sdk.getToken("0x912cef8d599dEEF2c255F1461286e53593dfA995");

(async () => {
    try {
        const walletAddresses = await editionDrop.history.getAllClaimerAddresses(0);

        if (walletAddresses.length === 0) {
            console.log("No NFTs have been claimed yet!");
            process.exit(0);
        }

        const airdropTargets = walletAddresses.map((address) => {
            // Pick a random # between 1000 and 10000.
            const randomAmount = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
            console.log("✅ Going to airdrop", randomAmount, "tokens to", address);

            const airdropTarget = {
                toAddress: address,
                amount: randomAmount
            };

            return airdropTarget;
        });

        console.log("🌈 Starting airdrop...");
        await token.transferBatch(airdropTargets);
        console.log("✅ Successfully airdropped tokens to all the holders of the NFT!");
    } catch (err) {
        console.error("Failed to airdrop tokens", err);
    }
})();
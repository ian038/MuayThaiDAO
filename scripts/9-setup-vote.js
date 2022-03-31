import sdk from "./1-initialize-sdk.js";

const vote = sdk.getVote("0x7BcF6f1Fdf942b39aC043362808f4157862c89e3");

const token = sdk.getToken("0x912cef8d599dEEF2c255F1461286e53593dfA995");

(async () => {
    try {
        await token.roles.grant("minter", vote.getAddress());
        console.log("Successfully gave vote contract permissions to act on token contract");
    } catch (error) {
        console.error("failed to grant vote contract permissions on token contract", error);
        process.exit(1);
    }

    try {
        const ownedTokenBalance = await token.balanceOf(process.env.WALLET_ADDRESS);

        const ownedAmount = ownedTokenBalance.displayValue;
        const percent80 = Number(ownedAmount) / 100 * 80;

        await token.transfer(vote.getAddress(), percent80);
        console.log("✅ Successfully transferred " + percent80 + " tokens to vote contract");
    } catch (err) {
        console.error("failed to transfer tokens to vote contract", err);
    }
})();
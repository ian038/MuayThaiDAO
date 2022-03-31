import sdk from "./1-initialize-sdk.js";
import { ethers } from "ethers";

const vote = sdk.getVote("0x7BcF6f1Fdf942b39aC043362808f4157862c89e3");

const token = sdk.getToken("0x912cef8d599dEEF2c255F1461286e53593dfA995");

(async () => {
    try {
        const amount = 400000;
        const description = "Should the DAO mint an additional " + amount + " tokens into the treasury?";
        const executions = [
            {
                toAddress: token.getAddress(),
                // nativeToken is ETH. nativeTokenValue is the amount of ETH we want
                // to send in this proposal.
                // We're just minting new tokens to the treasury. So, set to 0.
                nativeTokenValue: 0,
                // in this case, we need to use ethers.js to convert the amount
                // to the correct format. This is because the amount it requires is in wei.
                transactionData: token.encoder.encode("mintTo", [
                    vote.getAddress(),
                    ethers.utils.parseUnits(amount.toString(), 18)
                ])
            }
        ];

        await vote.propose(description, executions);

        console.log("✅ Successfully created proposal to mint tokens");
    } catch (error) {
        console.error("failed to create first proposal", error);
        process.exit(1);
    }

    try {
        const amount = 7000;
        const description = "Should the DAO transfer " + amount + " tokens from the treasury to " +
            process.env.WALLET_ADDRESS + " for being awesome?";
        const executions = [
            {
                nativeTokenValue: 0,
                // We're doing a transfer from the treasury to our wallet.
                transactionData: token.encoder.encode("transfer", [
                    process.env.WALLET_ADDRESS, ethers.utils.parseUnits(amount.toString(), 18)
                ]),
                toAddress: token.getAddress()
            },
        ];

        await vote.propose(description, executions);

        console.log("✅ Successfully created proposal to reward ourselves from the treasury!");
    } catch (error) {
        console.error("failed to create second proposal", error);
    }
})();
import sdk from "./1-initialize-sdk.js";

const token = sdk.getToken("0x912cef8d599dEEF2c255F1461286e53593dfA995");

(async () => {
    try {
        const amount = 1000000;
        await token.mint(amount);
        const totalSupply = await token.totalSupply();

        console.log("✅ There is now", totalSupply.displayValue, "$MUAYTHAI in circulation");
    } catch (error) {
        console.error("Failed to print money", error);
    }
})();
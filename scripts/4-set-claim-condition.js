import sdk from "./1-initialize-sdk.js";
import { MaxUint256 } from "@ethersproject/constants";

const editionDrop = sdk.getEditionDrop("0x973047353BCa0FcE8a6c75B7dfdC32C6eCAEF9D3");

(async () => {
    try {
        const claimConditions = [{
            startTime: new Date(),
            maxQuantity: 50_000,
            price: 0,
            quantityLimitPerTransaction: 1,
            waitInSeconds: MaxUint256
        }]

        await editionDrop.claimConditions.set("0", claimConditions);
        console.log("✅ Sucessfully set claim condition!");
    } catch (error) {
        console.error("Failed to set claim condition", error);
    }
})();
import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const editionDrop = sdk.getEditionDrop("0x973047353BCa0FcE8a6c75B7dfdC32C6eCAEF9D3");

(async () => {
    try {
        await editionDrop.createBatch([
            {
                name: "Mongkon",
                description: "This NFT will give you access to MuayThaiDAO!",
                image: readFileSync("scripts/assets/mongkon.jpg")
            }
        ]);
        console.log("✅ Successfully created a new NFT in the drop!");
    } catch (error) {
        console.error("failed to create the new NFT", error);
    }
})();
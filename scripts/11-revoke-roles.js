import sdk from "./1-initialize-sdk.js";

const token = sdk.getToken("0x912cef8d599dEEF2c255F1461286e53593dfA995");

(async () => {
    try {
        const allRoles = await token.roles.getAll();

        console.log("👀 Roles that exist right now:", allRoles);

        await token.roles.setAll({ admin: [], minter: [] });
        console.log("🎉 Roles after revoking ourselves", await token.roles.getAll());
        console.log("✅ Successfully revoked admin roles from the ERC-20 contract");
    } catch (error) {
        console.error("Failed to revoke ourselves from the DAO treasury", error);
    }
})();
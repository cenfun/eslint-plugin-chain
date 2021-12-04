module.exports = {
    plugins: ["chain"],
    rules: {
        "chain/dependencies": ["error", {
            "noSelfPackage": true,
            "noUppercase": true,
            "noUnlisted": true
        }]
    }
};
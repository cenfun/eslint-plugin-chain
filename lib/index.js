module.exports = {
    rules: {
        "no-unlisted-dependencies": require("./rules/no-unlisted-dependencies.js")
    },
    configs: {
        "recommended": require("./config/recommended.js")
    }
};
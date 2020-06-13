# eslint-plugin-chain

# Rules
- [chain/dependencies](lib/rules/dependencies.md): dependencies related detection


## Plugin Usage: recommended config
```js
module.exports = {
    plugins: [
        "chain"
    ],
    extends: [
        "plugin:chain/recommended"
    ]
}
```

## Plugin Usage: custom rules
```js
module.exports = {
    plugins: [
        "chain"
    ],
    rules: {
        "chain/dependencies": "error"
    }
}
```
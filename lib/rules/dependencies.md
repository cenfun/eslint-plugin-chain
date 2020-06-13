# chain/dependencies: dependencies related detection

Auto detection closest parent `package.json` and workspace `package.json` if monorepo.

### Options

`noSelfPackage`: Detection self package name. Defaults to `true`.

`noUppercase`: Detection name uppercase. Defaults to `true`.

`noUnlisted`: Detection module be listed in dependencies. Defaults to `true`.

`noDevDependenciesDir`: devDependencies limit for option `noUnlisted`. Defaults to `["**/src/**"]`.

### Plugin Usage: recommended config
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

### Plugin Usage: customize rule
```js
module.exports = {
    plugins: [
        "chain"
    ],
    rules: {
        "chain/dependencies": ["error", {
            "noSelfPackage": true,
            "noUppercase": true,
            "noUnlisted": true,
            "noDevDependenciesDir": ["**/src/**"]
        }]
    }
}
```

## Rule Details

Given the following Monorepo:

```
my-project
├ node_modules
├ packages
│   ├ module-core
│   │    ├ src
│   │    │   ├ lowercase-file.js
│   │    │   ├ Uppercase-File.js
│   │    │   └ index.js
│   │    ├ test
│   │    │   └ test.js
│   │    └ package.json
│   └ module-a
│        ├ src
│        │   └ index.js
│        ├ test
│        │   └ test.js
│        └ package.json
└ package.json
```

my-project/package.json
```json
{
  "name": "my-project",
  "dependencies": {
    "jquery": "latest",
    "lodash": "latest"
  },
  "devDependencies": {
    "webpack": "latest",
    "eslint": "latest",
    "eslint-plugin-chain": "latest"
  }
}
```
module-core/package.json
```json
{
  "name": "module-core",
  "dependencies": {
    "vue": "latest",
    "vue-router": "latest"
  },
  "devDependencies": {
    "@vue/cli-service": "latest"
  }
}
```
module-a/package.json
```json
{
  "name": "module-a",
  "dependencies": {
    "d3": "latest",
    "module-core": "latest"
  },
  "devDependencies": {
    "@vue/cli-service": "latest"
  }
}
```

- ## noSelfPackage: true
```js
//module-core/test/test.js
import Core from 'module-core'; // X Failed
import Core from '../src/'; // ✔ Passed

//module-a/src/index.js
import Core from 'module-core'; // ✔ Passed
```

- ## noUppercase: true
```js
//module-core/src/index.js
import File from './Uppercase-File.js'; // X Failed
import File from './lowercase-file.js'; // ✔ Passed
```

- ## noUnlisted: true
```js
//module-core/src/index.js
import Vue from 'vue'; // ✔ Passed
import Vue from 'vue/dist/vue.esm'; // ✔ Passed
import Vuex from 'vuex'; // X Failed

//module-a/src/index.js
import axios from 'axios'; // X Failed
import d3 from 'd3'; // ✔ Passed
import Core from 'module-core'; // ✔ Passed
import Vue from 'vue'; // ✔ Passed, vue listed in module-core
```

- ## noDevDependenciesDir: `["**/src/**"]`
```js
//module-core/src/index.js
import webpack from 'webpack'; // X Failed

//module-core/test/test.js
import webpack from 'webpack'; // ✔ Passed
```
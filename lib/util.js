const fs = require("fs");
const path = require("path");
const JSON5 = require("json5");
const isBuiltinModule = require("is-builtin-module");

const Util = {

    getDocUrl: (ruleName) => {
        return `https://github.com/cenfun/eslint-plugin-chain/blob/master/lib/rules/${ruleName}.md`;
    },

    getModuleName: (packageName, includeBuildInName) => {
        packageName += "";
        // ./, ../, /
        if (packageName.indexOf(".") === 0 || packageName.indexOf("/") === 0) {
            return "";
        }

        // build-in name fs, path
        if (isBuiltinModule(packageName)) {
            if (includeBuildInName) {
                return packageName;
            }
            return "";
        }
            
        // @scope/name, @scope/name/file
        if (packageName.indexOf("@") === 0) {
            const list = packageName.split("/");
            if (list.length < 2) {
                //invalid scope name @scope
                return "";
            }
            packageName = `${list[0]}/${list[1]}`;
        } else {
        // normal name, name/file
            packageName = packageName.split("/")[0];
        }

        return packageName;
    },
    getPackageJson: (packageJsonPath) => {
        const p = path.resolve(packageJsonPath, "package.json");
        if (fs.existsSync(p)) {
            return JSON5.parse(fs.readFileSync(p));
        }
    },

    getClosestPath: (dir, name, fromParent) => {
        const stat = fs.statSync(dir);
        if (!stat.isDirectory()) {
            dir = path.dirname(dir);
        }
        if (fromParent) {
            dir = path.resolve(dir, "../");
        }
        const max = 10;
        let i = 0;
        while (dir) {
            if (i > max) {
                dir = "";
                break;
            }
            if (fs.existsSync(path.resolve(dir, name))) {
                break;
            }
            const parentDir = path.resolve(dir, "../");
            if (parentDir === dir) {
                dir = "";
                break;
            }
            dir = parentDir;
            i += 1;
        }
        return dir;
    }

};

module.exports = Util;
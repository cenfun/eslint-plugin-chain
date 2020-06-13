const fs = require("fs");
const path = require("path");
const JSON5 = require("json5");
const ignore = require("ignore");
const FlatDep = require("flatdep");
const isBuiltinModule = require("is-builtin-module");

const Util = {

    isBuiltinModule: isBuiltinModule,

    getDocUrl: (ruleName) => {
        return `https://github.com/cenfun/eslint-plugin-chain/blob/master/lib/rules/${ruleName}.md`;
    },

    getModuleName: (packageName) => {
        packageName += "";
        // ./, ../, /
        if (packageName.indexOf(".") === 0 || packageName.indexOf("/") === 0) {
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
    },

    getWorkspaceNodeModules: (packageJsonPath, packageName) => {
        const nodeModulesPath = Util.getClosestPath(packageJsonPath, "node_modules");
        const parentNodeModulesPath = Util.getClosestPath(packageJsonPath, "node_modules", true);
        if (!parentNodeModulesPath) {
            return nodeModulesPath;
        }
    
        //detect workspace
        const p = path.resolve(parentNodeModulesPath, "node_modules", packageName);
        const stat = fs.lstatSync(p);
        const isLink = stat.isSymbolicLink();
        if (isLink) {
            const link = fs.readlinkSync(p);
            const relative = path.relative(link, nodeModulesPath);
            if (!relative) {
                return parentNodeModulesPath;
            }
        }
    
        return nodeModulesPath;
    },

    getIgnore: (noDevDependenciesDir) => {
        if (!noDevDependenciesDir) {
            return null;
        }
        if (!Array.isArray(noDevDependenciesDir)) {
            noDevDependenciesDir = [noDevDependenciesDir];
        }
        const ig = ignore();
        noDevDependenciesDir.forEach(item => {
            ig.add(item);
        });
        return ig;
    },

    initDependencies: (o) => {
        if (!o.noUnlisted) {
            return;
        }

        //is filename noDevDependencies
        const p = path.relative(process.cwd(), o.filename);
        //console.log(filename, p);
        const ig = Util.getIgnore(o.noDevDependenciesDir);
        if (ig && ig.ignores(p)) {
            o.noDevDependencies = true;
        }

        //all dependencies
        o.packageName = o.packageJson.name;
        const packageDevDependencies = Object.assign({}, o.packageJson.devDependencies);
    
        o.nodeModules = Util.getWorkspaceNodeModules(o.packageJsonPath, o.packageName);
        //console.log("nodeModules", nodeModules);

        const d = FlatDep({
            //stop log message
            silent: true,
            noBrowser: true,
            //project entry path (package.json folder)
            entry: o.packageJsonPath,
            //node_modules path to detect dependencies
            nodeModules: o.nodeModules
        });
        // if (d.error) {
        //     console.log(d.error);
        // }
    
        //console.log(d);
        o.dependencies = d.modules;

        //all devDependencies, append workspace dependencies and devDependencies
        if (o.packageJsonPath !== o.nodeModules) {
            const wsPackageJson = Util.getPackageJson(o.nodeModules);
            if (wsPackageJson) {
                Object.assign(packageDevDependencies, wsPackageJson.devDependencies, wsPackageJson.dependencies);
            }
        }
        o.devDependencies = Object.keys(packageDevDependencies);
    
    }

};

module.exports = Util;

const fs = require("fs");
const path = require("path");
const FlatDep = require("flatdep");
const moduleVisitor = require("eslint-module-utils/moduleVisitor");
const Util = require("../util.js");

const getWorkspaceNodeModules = (packageJsonPath, packageName) => {
    const nodeModulesPath = Util.getClosestPath(packageJsonPath, "node_modules");
    const parentNodeModulesPath = Util.getClosestPath(packageJsonPath, "node_modules", true);
    if (!parentNodeModulesPath) {
        return nodeModulesPath;
    }

    //workspace
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
};

const getDependencies = (filename, noParent) => {
    const packageJsonPath = Util.getClosestPath(filename, "package.json");
    //console.log("packageJsonPath", packageJsonPath);

    const packageJson = Util.getPackageJson(packageJsonPath);
    if (!packageJson) {
        return;
    }
    if (noParent) {
        const ds = packageJson.dependencies || {};
        return Object.keys(ds);
    }

    const nodeModules = getWorkspaceNodeModules(packageJsonPath, packageJson.name);
    //console.log("nodeModules", nodeModules);

    const d = FlatDep({
        //stop log message
        silent: true,
        //project entry path (package.json folder)
        entry: packageJsonPath,
        //node_modules path to detect dependencies
        nodeModules: nodeModules,
        //node: only main, no browser
        type: "node"
    });
    // if (d.error) {
    //     console.log(d.error);
    // }

    //console.log(d);

    return d.modules;
};

function reportIfMissing(context, deps, node, packageName) {
    // Do not report when importing types
    if (node.importKind === "type") {
        return;
    }

    const moduleName = Util.getModuleName(packageName);
    if (!moduleName) {
        return;
    }

    //console.log(moduleName);
    if (!deps[moduleName]) {
        context.report(node, `'${moduleName}' should be listed in dependencies. Run 'npm install ${moduleName}' to add it`);
    }
    
}

//https://eslint.org/docs/developer-guide/working-with-plugins
module.exports = {
    meta: {
        type: "problem",
        docs: {
            url: Util.getDocUrl("no-unlisted-dependencies")
        },
        schema: [{
            "type": "object",
            "properties": {
                "noParent": {
                    "type": "boolean"
                }
            },
            "additionalProperties": false
        }]
    },
  
    create: function(context) {
        //console.log(ruleName, context);
        const options = context.options[0] || {};
        const noParent = options.noParent;
        const filename = context.getFilename();
        //console.log("filename", filename);
        const dependencies = getDependencies(filename, noParent);
        const deps = {};
        dependencies.forEach(k => {
            deps[k] = true;
        });

        //console.log("dependencies", noParent, deps);

        return moduleVisitor.default(node => {
            reportIfMissing(context, deps, node, node.value);
        }, {
            commonjs: true
        });

    }
};
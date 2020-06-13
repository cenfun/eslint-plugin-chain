
const moduleVisitor = require("eslint-module-utils/moduleVisitor");
const Util = require("../util.js");

const getOptions = (options) => {
    const defaultOptions = {
        noSelfPackage: true,
        noUppercase: true,
        noUnlisted: true,
        noDevDependenciesDir: ["**/src/**"]
    };
    return Object.assign(defaultOptions, options);
};

const reportNoSelfPackage = (context, node, o) => {
    if (!o.noSelfPackage) {
        return;
    }
    if (o.packageName !== o.value) {
        return;
    }
    context.report(node, `'${o.value}' should NOT be self package name.`);
    o.isSelfPackageReport = true;
};

const reportNoUppercase = (context, node, o) => {
    if (!o.noUppercase) {
        return;
    }
    const lowercase = o.value.toLowerCase();
    if (lowercase === o.value) {
        return;
    }
    context.report(node, `'${o.value}' should be all lowercase letter.`);
    o.isUppercaseReport = true;
};

const checkModuleName = (context, node, o, moduleName) => {
    //console.log(moduleName);
    if (o.dependencies.includes(moduleName)) {
        return;
    }

    if (!o.noDevDependencies && o.devDependencies.includes(moduleName)) {
        return;
    }

    if (o.noDevDependencies) {
        if (o.devDependencies.includes(moduleName)) {
            context.report(node, `'${moduleName}' is listed in devDependencies should NOT be allowed in this file. check 'noDevDependenciesDir': ${o.noDevDependenciesDir}`);
            return;
        }
    }
    context.report(node, `'${moduleName}' should be listed in dependencies. Run 'npm install ${moduleName}' to add it`);
};

const reportNoUnlisted = (context, node, o) => {
    if (!o.noUnlisted) {
        return;
    }
    if (o.isSelfPackageReport || o.isUppercaseReport) {
        return;
    }
    if (Util.isBuiltinModule(o.value)) {
        return;
    }
    const moduleName = Util.getModuleName(o.value);
    if (!moduleName) {
        return;
    }
    checkModuleName(context, node, o, moduleName);
};

//https://eslint.org/docs/developer-guide/working-with-plugins
module.exports = {
    meta: {
        type: "problem",
        docs: {
            url: Util.getDocUrl("dependencies")
        },
        schema: [{
            "type": "object",
            "properties": {
                "noSelfPackage": {
                    "type": "boolean"
                },
                "noUppercase": {
                    "type": "boolean"
                },
                "noUnlisted": {
                    "type": "boolean"
                },
                "noDevDependenciesDir": {
                    "type": ["string", "array"]
                }
            },
            "additionalProperties": false
        }]
    },
  
    create: function(context) {
        //console.log(ruleName, context);
        const o = getOptions(context.options[0]);
        
        o.filename = context.getFilename();
        //console.log("filename", filename);

        o.packageJsonPath = Util.getClosestPath(o.filename, "package.json");
        //console.log("packageJsonPath", packageJsonPath);

        o.packageJson = Util.getPackageJson(o.packageJsonPath);
        if (!o.packageJson) {
            return;
        }

        Util.initDependencies(o);

        //console.log("dependencies", noParent, dependencies);

        return moduleVisitor.default(node => {
            // Do not report when importing types
            if (node.importKind === "type") {
                return;
            }
            o.value = `${node.value}`;
            reportNoSelfPackage(context, node, o);
            reportNoUppercase(context, node, o);
            reportNoUnlisted(context, node, o);
        }, {
            commonjs: true
        });

    }
};
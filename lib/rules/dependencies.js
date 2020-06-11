
import flatdep from "flatdep";
const githubDir = "https://github.com/cenfun/eslint-plugin-chain/blob/master";

const getDependencies = (context, onlyParent) => {
    const filename = context.getFilename();
};

//https://eslint.org/docs/developer-guide/working-with-plugins
export const dependencies = {
    meta: {
        type: "problem",
        docs: {
            url: `${githubDir}/lib/rules/dependencies.md`
        },
  
        schema: [
            {
                "type": "object",
                "properties": {
                    "onlyParent": {
                        "type": "boolean"
                    }
                },
                "additionalProperties": false
            }
        ]
    },
  
    create: function(context) {
        const options = context.options[0] || {};
       
        const deps = getDependencies(context, options.onlyParent);
  
        
    }
};
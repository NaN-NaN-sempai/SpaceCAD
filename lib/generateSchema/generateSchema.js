/* 
File Description: library used to generate API schema
It reads all the files in the selected directory and generates a schema of the API for each directory.
*/


import fs from "fs";
import path from "path";


import { parse } from "acorn";




class JSDoc {
    static arrayTags = {
        params: ["param"],
        properties: ["property", "prop"]
    };
    static typeTags = [
        "returns",
        "return",
        "throws",
        "exception",
        "type",
        "extends",
        "augments",
        "implements",
        "satisfies",
    ];
    constructor(origin, jsdoc, types = []) {
        const { type, name, declarationType } = origin || {};
        const value = typeof jsdoc == "object" ? jsdoc.value || "" : "";
        const lines = value
            .split(/\r?\n/)
            .map(line => line.replace(/^\s*\*\s?/, "").trim())
            .filter(Boolean);

        const data = {};

        for (const line of lines) {
            if (!line.startsWith("@")) {
                data.summary = data.summary || "";
                data.summary += line + "\n";
                continue;
            }

            const match = line.match(/^@(\w+)(?:\s+(.*))?$/);

            if (!match) continue;

            const [, tag, content = ""] = match;

            const arrayTag = Object.entries(JSDoc.arrayTags)
                .find(([key, values]) => values.includes(tag));

            if (arrayTag) {
                const [name] = arrayTag;

                if (data[name] === undefined)
                    data[name] = [];

                data[name].push(
                    tag === "param"
                        ? new JSDoc.TypeParam(content, types) :
                        tag === "property" || tag === "prop" ?
                            new JSDoc.TypeProperty(content, types)
                            : content
                );

                continue;
            }

            if (JSDoc.typeTags.includes(tag)) {
                data[tag] = new JSDoc.Type(content, types);
                continue;
            }

            data[tag] = content;
        }

        let obj;
        if (type == "function") obj = new JSDoc.Function(data, name);
        if (type == "variable" || type == "property") obj = new JSDoc.AsVariable(type, data, name);
        if (type == "class") obj = new JSDoc.Class(data, name, origin.classBody);
        if (!type) obj = {jsdoc: data};

        obj.declarationType = declarationType;
        obj.static = origin.static;

        return obj;
    }



    static Type = class Type {
        static instances = [];
        constructor(content, types = [], description = null) {
            const match = typeof content == "object" ?
                true :
                content.match(/^\{([^}]+)\}(?:\s+(.*))?$/);

            if (!match) {
                this.name = null;
                return;
            }

            const type = () => match[1]
                .replace(/\[\]$/, "")
                .replace(/^Array<(.+)>$/, "$1");

            const transfer = (og, obj) => {
                Object.entries(og).forEach(([key, value]) => {
                    if(value != undefined && value != obj[key])
                        obj[key] = value;
                });
            }
            const find = JSDoc.Type.instances.find(instance =>
                typeof content == "object" ? instance.name == content.name :
                    instance.name == type()
            )
            if (find) {
                if (typeof content == "object") {
                    transfer(content, find);
                }
                else if(description)
                    find.description = description;

                return find;
            }

            if (typeof content == "object") {
                transfer(content, this);

                if (this.extends) {
                    this.extends =
                        JSDoc.Type.instances.find(instance => instance.name == this.extends) ||
                        new JSDoc.Type(this.extends);
                }

            } else {
                this.name = type();

                this.description = description;
            }

            this.isType = true;
            this.register(types);

            JSDoc.Type.instances.push(this);
        }

        register(types = []) {
            if (!types.some(item => item.name === this.name)) {
                types.push(this);
            }
        }
    };

    /**
     * caramba
     * sete dias
     */
    static UseType = class UseType {
        constructor(content, types = []) {
            this.type = new JSDoc.Type(content, types);

            const match = content.match(
                /^\{([^}]+)\}\s+(\[[^\]]+\]|\S+)(?:\s+-\s+)?(.*)?$/
            );

            if (!match) return;

            const [, rawType, rawName, description = ""] = match;

            this.array =
                rawType.endsWith("[]") ||
                /^Array<.+>$/.test(rawType);

            this.name = rawName.replace(/^\[|\]$/g, "");

            const defaultMatch = this.name.match(/^([^=]+)=(.*)$/);

            if (defaultMatch) {
                this.name = defaultMatch[1];
                this.default = defaultMatch[2];
            } else {
                this.default = null;
            }

            this.description = description || null;
        }
    };

    static TypeParam = class TypeParam extends JSDoc.UseType {
        constructor(content, types = []) {
            super(content, types);
        }
    }
    static TypeProperty = class TypeProperty extends JSDoc.UseType {
        constructor(content, types = []) {
            super(content, types);
        }
    }

    static DataBase = class DataBase {
        constructor(type, name, data) {
            this.name = name;
            this.type = type;
            this.jsdoc = data;
        }
    }

    static AsVariable = class AsVariable {
        constructor(type, data, name) {
            if (type == "variable") return new JSDoc.Variable(data, name);
            if (type == "property") return new JSDoc.Property(data, name);
        }
    }
    static Variable = class Variable extends JSDoc.DataBase {
        constructor(data, name) {
            super("variable", name, data);
        }
    }
    static Property = class Variable extends JSDoc.DataBase {
        constructor(data, name) {
            super("property", name, data);
        }
    }
    static Function = class Function extends JSDoc.DataBase {
        constructor(data, name) {
            super("function", name, data);
        }
    }
    static Class = class Class extends JSDoc.DataBase {
        constructor(data, name, classBody) {
            super("class", name, data);
            this.classBody = classBody;
        }
    }
}




export const getJsElements = (str, types = []) => {
    const content = str;
    const comments = [];
    const elements = [];

    const ast = parse(content, {
        ecmaVersion: "latest",
        sourceType: "module",
        onComment: comments
    });

    const jsdocs = comments.filter(comment =>
        comment.type === "Block" &&
        comment.value.startsWith("*")
    )
    .map(comment => ({
        ...comment,
        used: false
    }));


    const walkStarter = ast => {
        const elements = [];

        const gatherClass = (name, body) => {
            const obj = {
                type: "class",
                name,
                classBody: []
            }

            for (const member of body) {
                obj.classBody.push(...walkStarter(member));
            }

            return obj;
        }
        const asVar = (node, type) => {
            let switcher;
            let name;
            let classTraverser;
            if (type == "variable") {
                const declaration = node.declarations[0];
                name = declaration.id.name;
                switcher = declaration?.init?.type;
                classTraverser = declaration?.init?.body?.body;

            } else if (type == "property") {
                name = node.key?.name ?? node.key?.value;
                switcher = node.value?.type;
                classTraverser = node?.value?.body?.body;


            }

            let obj = {
                name,
                declarationType: node.kind
            }

            switch (switcher) {
                case "FunctionExpression":
                case "ArrowFunctionExpression":
                    obj.type = "function";
                    break;

                case "ClassExpression":
                    obj = {
                        ...obj,
                        ...gatherClass(obj.name, classTraverser)
                    };
                    break;

                default:
                    obj.type = type;
                    break;
            }
            return obj;
        }
        const walk = node => {
            if (!node || typeof node !== "object") return;

            let obj = {}
            
            const jsdoc = jsdocs
                .find(comment =>
                    !comment.used &&
                    comment.end <= node.start
                );


            if (jsdoc) jsdoc.used = true;

            switch (node.type) {
                case "FunctionDeclaration":
                    obj.type = "function";
                    obj.name = node.id?.name;
                    break;

                case "ClassDeclaration":
                    obj = gatherClass(node.id?.name, node.body.body);
                    break;

                case "MethodDefinition":
                    obj.type = "function";
                    obj.name = node.key?.name;
                    obj.declarationType = "method";
                    break;

                case "PropertyDefinition":
                    obj = asVar(node, "property");
                    break;

                case "VariableDeclaration": {
                    obj = asVar(node, "variable");
                    break;
                }


                default:
                    break;
            }

            if (node.static)
                obj.static = true;
            

            if(obj.type || jsdoc)
                elements.push(new JSDoc(obj, jsdoc, types));
        };

        if (ast.type === "Program") {
            for (const node of ast.body)
                walk(node);
        } else {
            walk(ast);
        }

        return elements;
    };

    return walkStarter(ast);
}




class Path {
    constructor(fullPath) {
        this.name = path.basename(fullPath);
        this.path = fullPath;
    }
}

class FileEntry extends Path {
    constructor(path, types) {
        super(path);

        if (path.toLowerCase().endsWith(".js"))
            this.type = "js";
        else if (path.toLowerCase().endsWith(".html"))
            this.type = "html";



        const readFile = fs.readFileSync(path, "utf-8");


        if (this.type === "js") {
            this.description = readFile.match(
                /^\s*\/\/\s*File Description:\s*(.*?)\s*$/m
            )?.[1]?.trim();

            if (!this.description) {
                this.description = readFile.match(
                    /\/\*\s*File Description:\s*([\s\S]*?)\s*\*\//
                )?.[1]?.trim();
            }
        }

        else if (this.type === "html") {
            this.description = readFile.match(
                /<!--\s*File Description:\s*([\s\S]*?)\s*-->/
            )?.[1]?.trim();
        }

        if (this.description) {
            let defining = false;
            let obj = {};

            const entries = Object.entries(this.description.split("\n"));
            for (let [index, line] of entries) {
                line = line.trim();

                if (!defining) {
                    if (line.startsWith("@type")) {
                        obj.name = line.replace("@type", "").trim();
                        defining = true;
                    }
                } else {
                    if (line === "@end") {
                        new JSDoc.Type(obj, types);
                        obj = {};
                        defining = false;

                    } else if (line.startsWith("@")) {
                        const match = line.match(/^@(\w+)(?:\s+(.*))?$/);

                        if (!match) continue;

                        const [, tag, content = ""] = match;

                        obj[tag] = content.trim();
                    } else {
                        if (!obj.summary) obj.summary = "";
                        obj.summary += line + "\n";
                    }

                    if (index === entries.length - 1)
                        new JSDoc.Type(obj, types);
                }
            }
        }



        if (this.type == "js")
            this.data = getJsElements(readFile, types);
        else if (this.type == "html") {
            this.scripts = [];

            [...readFile.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
                .filter(([_, attributes]) =>
                    !/\btype\s*=\s*["']importmap["']/i.test(attributes)
                )
                .forEach(([_, attributes, content]) => {
                    if (!content.trim()) return;

                    const data = getJsElements(content, types);
                    if (data.length)
                        this.scripts.push(data);
                });
        }
    }
}

class Directory extends Path {
    constructor(fullpath, ignorePath = [], ignoreStartsWith = [], fileTypes = [], types = []) {
        super(fullpath);

        const join = (file) => path.join(fullpath, file);

        this.files = fs.readdirSync(fullpath)
            .filter(file => 
                !ignoreStartsWith.some(start => file.startsWith(start)) &&
                !ignorePath.includes(file)
            )
            .filter(file => {
                const fullPath = join(file);

                return fs.statSync(fullPath).isDirectory()
                    || fileTypes.some(type => file.endsWith(type));
            })
            .sort((a, b) => {
                const aDir = fs.statSync(join(a)).isDirectory();
                const bDir = fs.statSync(join(b)).isDirectory();

                return bDir - aDir;
            })
            .map(file => objectify(join(file), ignorePath, ignoreStartsWith, fileTypes, types))
            .filter(file => !(file instanceof Directory) || file.files.length > 0);
    }
}


export const objectify = (dir = "./", ignorePath, ignoreStartsWith, fileTypes, types = []) => {
    if (fs.statSync(dir).isFile()) return new FileEntry(dir, types);

    return new Directory(dir, ignorePath, ignoreStartsWith, fileTypes, types);
};

const generateApiSchema = (dir = "./", ignorePath, ignoreStartsWith, fileTypes) => {
    const types = [];

    const schema = objectify(dir, ignorePath, ignoreStartsWith, fileTypes, types);

    return {
        types,
        schema
    };
}

export default generateApiSchema;
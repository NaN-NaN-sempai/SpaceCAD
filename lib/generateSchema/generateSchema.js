/* 
@fileSummary
library used to generate API schema
It reads all the files in the selected directory and generates a schema of the API for each directory.
*/

import fs from "fs";
import path from "path";

import { parse } from "acorn";
import { fileURLToPath } from "url";

let id = 0;
const genId = () => id++;

/**
 * esse summary vai para todos
 * 
 * @for a 
 * @type {number}
 * @description minha descrição 1
 * 
 * @for b
 * @type {string}
 * @description minha descrição 2
 */
const {a,b, ...rest} = {
    a: 1,
    b: 2
}


class Getter {
    constructor(obj) {
        this.isGetter = true;
        this.for = obj.id;
    }
}


/**
  * 
 * Represents the parser and data model used to process JSDoc annotations.
 * 
 * 
 * The class parses JSDoc comment content, converts tags into structured data,
 * resolves referenced types, and creates internal representations for
 * functions, variables, properties, classes, and type definitions.
 * 
 * 
 * @class JSDoc
 * 
 * 
 * @property {object} arrayTags Tags whose values are stored as arrays, such as parameters and properties.
 * 
 * 
 * @property {string} [typeTags] JSDoc tags that represent or reference a type.
 * 
 * 
 * @property {string} definitionTags JSDoc tags that define a code element.
 * 
 * 
 * @property {string} referenceTags JSDoc tags that reference another code element or definition.
 */
class JSDoc {
    static arrayTags = {
        params: ["param"],
        properties: ["property", "prop"]
    };
    static typeTags = [
        "throws",
        "exception",
        "type",
        "extends",
        "augments",
        "implements",
        "satisfies",
    ];
    static definitionTags = [
        "function",
        "class",
        "typedef",
        "module",
        "interface",
        "namespace",
        "enum"
    ];
    static referenceTags = [
        "returns",
        "return",
        "see"
    ];

    constructor(origin, jsdoc, path = "", charger = {}) {
        const { type, name } = origin || {};
        const value = jsdoc?.value || "";
        const lines = value
            .split(/\r?\n/)
            .map(line => line.replace(/^\s*\*\s?/, "").trim())
            .filter(Boolean);

        let data = {};

        let lineAcc = "";
        const entries = [];

        const add = str => {
            if(str)
                entries.push(str.trim());
        }

        for (const line of lines) {
            if(line.startsWith("@")) {
                add(lineAcc);
                lineAcc = "";
            }

            lineAcc += line + "\n";
        }

        add(lineAcc);

        const datas = [];
        let signature = false;
        for(let entrie of entries) {
            const match = entrie.match(/^@(\w+)(?:\s+([\s\S]*))?$/);

            if(!match) {
                data.summary = data.summary || "";
                data.summary += entrie + "\n";

                continue;
            }

            const [, tag, content = ""] = match;

            if(tag == "signature" && content.trim() == "end") {
                signature = false;
                continue;
            }
            if(tag == "signature") {
                signature = true;
                continue;
            }

            if(signature) {
                data.signature = data.signature || {};
                data.signature[tag] = content.trim();
                continue;
            }

            if(tag == "for") {
                datas.push(data);

                data = {
                    target: content
                };
                continue;
            }

            const arrayTag = Object.entries(JSDoc.arrayTags)
                .find(([key, values]) => values.includes(tag));

            if (arrayTag) {
                const [name] = arrayTag;

                if (data[name] === undefined)
                    data[name] = [];

                data[name].push(
                    tag === "param"
                        ? new JSDoc.TypeParam(content, charger) :
                        tag === "property" || tag === "prop" ?
                            new JSDoc.TypeProperty(content, charger)
                            : content
                );

                continue;
            }

            if (JSDoc.typeTags.includes(tag)) {
                data[tag] = new Getter(new JSDoc.Type(content, charger));
                continue;
            }
            
            if (JSDoc.referenceTags.includes(tag) || JSDoc.definitionTags.includes(tag)) {
                data[tag] = content;
                continue;
            }

            data[tag] = content;
        }
        datas.push(data);

        const parseOrigin = () => {
            return {
                names: origin.names,
                static: origin.static,
                declarationType: origin.declarationType,
                line: origin.line,
                column: origin.column,
            }
        }
        data = {
            ...data,
            ...parseOrigin()
        }

        let obj = {};
        let tempObj;
        if (type == "function") tempObj = new JSDoc.Function(name, data, charger, path);
        else if (type == "variable" || type == "property") tempObj = JSDoc.AsVariable(type, name, data, charger, path);
        else if (type == "class") tempObj = new JSDoc.Class(name, data, charger, path, origin.classBody);
        else if (type != undefined) {
            let targetData = {
                ...(datas[0] ?? {}),
                ...(datas.find(e => e.target === name) ?? {}),
                ...parseOrigin(),
            };

            tempObj = new JSDoc.DataBase(type, name, targetData, charger, path);
        }
        if (!type) obj = {jsdoc: data};

        if(tempObj) {
            obj = new Getter(tempObj);
        }

        Object.assign(this, obj);
    }


    static TypeIdentificator = class TypeIdentificator {
        static createTypes(content, charger) {
            const value = typeof content === "object"
                ? content.name
                : content;

            const match = value.match(/^\{([^}]+)\}/);
            const typeContent = match ? match[1] : value;

            return typeContent
                .split("|")
                .map(type => type.trim())
                .filter(Boolean)
                .map(name =>
                    new JSDoc.TypeIdentificator(
                        new JSDoc.Type(`{${name}}`, charger),
                        name
                    )
                );
        }

        constructor(instance, content) {
            this.target = new Getter(instance);
            this.array =
                content === "Array" ||
                content.endsWith("[]") ||
                /^Array<.+>$/.test(content);
        }
    };
    static CompPath = class CompPath {
        constructor(path, line, column) {
            this.origin = path;
            this.line = line;
            this.column = column;
        }
    }

    static Type = class Type {
        static instances = [];
        static find (content, getName = false) {
            const match = typeof content == "object"?
                ["","~"]:
                content.match(/^\{([^}]+)\}(?:\s+(.*))?$/);

            if (!match) {
                return;
            }

            const name = match[1]
                .replace(/\[\]$/, "")
                .replace(/^Array<(.+)>$/, "$1");

            if(getName) return name;

            return JSDoc.Type.instances.find(instance =>
                typeof content == "object" ? instance.name == content.name :
                    instance.name == name
            )
        }
        constructor(content, charger, description = null) {
            const name = JSDoc.Type.find(content, true);

            if (!name) {
                return;
            }
            
            const transfer = (og, obj) => {
                Object.entries(og).forEach(([key, value]) => {
                    if(value != undefined && value != obj[key])
                        obj[key] = value;
                });
            }

            const find = JSDoc.Type.find(content);
            if (find) {
                if (typeof content == "object") {
                    transfer(content, find);
                }
                else if(description)
                    find.description = description.trim();

                return find;
            }

            if (typeof content == "object") {
                transfer(content, this);

                if (this.extends) {
                    this.extends =
                        JSDoc.Type.instances.find(instance => instance.name == this.extends).id ||
                        new JSDoc.Type(this.extends).id;
                }

            } else {
                this.name = name;

                this.description = description?.trim();
            }

            this.id = genId();
            this.register(charger);

            JSDoc.Type.instances.push(this);
        }

        register(charger) {
            const types = charger.types;
            if (!types.some(item => item.name === this.name)) {
                types.push(this);
            }
        }
    };

    static Definition = class Definition {
        constructor(type, content, data, path, charger) {
            let [, name, summary = ""] =
                content.match(/^(\S+)(?:\s+([\s\S]*))?$/) || [];

            this.name = name;

            if(summary) {
                this.summary = summary;
            }

            this.target = new Getter(new JSDoc.Type(`{${type}}`, charger));

            this.path = new JSDoc.CompPath(path, data.line, data.column);
            this.id = genId();
            charger.definitions.push(this);
        }
    }
    static Reference = class Reference {
        constructor(data, origin, tag, path, charger) {
            const [, reference, summary = ""] =
                origin[tag].match(/^\{([^}]+)\}(?:\s+([\s\S]*))?$/) || [];

            if(!reference)
                this.summary = origin[tag];
            else {
                if(summary)
                    this.summary = summary;

                charger.stash(() => {
                    let ref = reference;

                    let allPath;
                    if(ref.startsWith("~")) {
                        allPath = ref.split(" ")[0].slice(1);
                        ref = ref.split(" ")[1];
                    }

                    this.type = ref.split("|").map(comp => {
                        let [ref, refPath] = comp.split("~");
                        refPath = allPath || refPath;
                        console.log(refPath)

                        const searchRef = ref
                            .replace(/\[\]$/, "")
                            .replace(/^Array<(.+)>$/, "$1");

                        const getInstance = () => {
                            const findType = charger.types.find(e => e.name == searchRef);
                            if(findType)
                                return findType;

                            charger.references.forEach(e => {
                                if(e.path.origin.includes("chargerStructure"))
                                console.log(refPath, " ~ ", e.path.origin)
                            })
                            const findReference = charger.references.find(e => 
                                e.name == searchRef &&
                                (e.path.origin == (refPath || path))
                            );
                            if(findReference) 
                                return findReference;

                            const findDefinition = charger.definitions.find(e => 
                                e.name == searchRef &&
                                (e.path.origin == (refPath || path))
                            );
                            if(findDefinition)
                                return findDefinition;

                            return new JSDoc.Type(`{${searchRef}}`, charger);
                        }

                        let instance = getInstance();

                        return new JSDoc.TypeIdentificator(instance, ref);
                    });
                });
            }
        }
    }

    static UseType = class UseType {
        constructor(content, charger) {
            this.type = JSDoc.TypeIdentificator.createTypes(content, charger);

            const match = content.match(
                /^\{([^}]+)\}\s+(\[[^\]]+\]|\S+)(?:\s+-\s+)?([\s\S]*)?$/
            );

            if (!match) return;

            const [, rawType, rawName, description = ""] = match;

            this.name = rawName.replace(/^\[|\]$/g, "");

            const defaultMatch = this.name.match(/^([^=]+)=(.*)$/);

            if(/^\[.*\]$/.test(rawName))
                this.optional = true;

            if (defaultMatch) {
                this.name = defaultMatch[1];
                this.default = defaultMatch[2];
            } else {
                this.default = undefined;
            }

            this.description = description?.trim() || null;
        }
    };

    static TypeParam = class TypeParam extends JSDoc.UseType {
        constructor(content, charger) {
            super(content, charger);
        }
    }
    static TypeProperty = class TypeProperty extends JSDoc.UseType {
        constructor(content, charger) {
            super(content, charger);
        }
    }

    static DataBase = class DataBase {
        constructor(type, name, data, charger, path) {
            this.name = name;
            this.type = type;

            const ignoreTags = [];

            Object.entries(data).forEach(([key, value]) => {
                if (JSDoc.referenceTags.includes(key)) {
                    data[key] = new JSDoc.Reference(this, data, key, path, charger);
                } else if (JSDoc.definitionTags.includes(key)) {
                    data.definition = new Getter(new JSDoc.Definition(key, value, data, path, charger));
                    ignoreTags.push(key);
                }
            });
            this.declarationType = data.declarationType;
            this.static = data.static;

            this.jsdoc = {}
            this.path = new JSDoc.CompPath(path, data.line, data.column);
            const dataToThis = [
                "static",
                "declarationType",
                "line",
                "names",
            ];
            dataToThis.forEach(key => this[key] = data[key]);
            this.id = genId();

            const ignoreData = [
                "target",
                "line",
                "column",
            ]
            Object.entries(data).forEach(([key, value]) => {
                if (!ignoreData.includes(key) && !dataToThis.includes(key) && !ignoreTags.includes(key))
                    this.jsdoc[key] = value;
            });
            
            charger.references.push(this);
        }
    }

    static AsVariable(type, ...args) {
        if (type == "variable") return new JSDoc.Variable(...args);
        if (type == "property") return new JSDoc.Property(...args);
    }
    static Variable = class Variable extends JSDoc.DataBase {
        constructor(...args) {
            super("variable", ...args);
        }
    }
    static Property = class Property extends JSDoc.DataBase {
        constructor(...args) {
            super("property", ...args);
        }
    }
    static Function = class Function extends JSDoc.DataBase {
        constructor(...args) {
            super("function", ...args);
        }
    }
    static Class = class Class extends JSDoc.DataBase {
        constructor(...args) {
            super("class", ...args);
            this.classBody = args.at(-1);
        }
    }
}




export const getJsElements = (str, path = "", charger) => {
    const content = str;
    const comments = [];

    const ast = parse(content, {
        ecmaVersion: "latest",
        sourceType: "module",
        onComment: comments,
        locations: true,
    });

    const ignore = {
        all: "@ignoreSchema all",
        next: "@ignoreSchema next",
        begin: "@ignoreSchema begin",
        end: "@ignoreSchema end"
    }
    const jsdocs = comments.filter(comment =>
        (
            comment.type === "Block" &&
            comment.value.startsWith("*")
        ) ||
        (
            Object.values(ignore).includes(comment.value.trim())
        )
    )
    .map(comment => ({
        ...comment,
        used: false
    }));


    let ignoreSchema = false;
    let ignoreAll = false;
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

            let multipleAssignation = false;
            if (type == "variable") {
                const declaration = node.declarations[0];

                if (["ObjectPattern", "ArrayPattern"].includes(declaration.id.type)) {
                    const isArray = !!declaration.id.elements;

                    name = declaration.id[isArray? "elements" : "properties"]
                    .map(element => {
                        if (element?.type === "RestElement")
                            return element.argument?.name;

                        return isArray?
                            element?.name :
                            element.value?.name ?? element.key?.name;
                    });

                    multipleAssignation = `patern assignment from ${isArray? "array" : "object"}`;
                } else
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

            if(Array.isArray(name)) {
                obj.names = name;
                obj.type = multipleAssignation;
                return obj;
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
            if (!node || typeof node !== "object" || ignoreAll) return;

            let obj = {}
            
            const jsdoc = jsdocs
                .find(comment =>
                    !comment.used &&
                    comment.end <= node.start
                );


            if (jsdoc) {
                jsdoc.used = true;


                if(jsdoc.value.trim() === ignore.all) {
                    ignoreAll = true;
                    return;
                }

                if (jsdoc.value.trim() === ignore.begin) {
                    ignoreSchema = true;
                    return;
                }

                if (jsdoc.value.trim() === ignore.end) {
                    ignoreSchema = false;
                    return;
                }

                if (jsdoc.value.trim() === ignore.next)
                    return;
            }

            if(ignoreSchema) return;

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

            const setObj = () => {
                const names = Array.isArray(obj.name) ? obj.name : [obj.name];
                if (node.static)
                    obj.static = true;

                for (const name of names) {
                    const temp = {
                        ...obj,
                        name,
                        line: node.loc.start.line,
                        column: node.loc.start.column,
                    }

                    if(temp.type || jsdoc) {
                        const position = `${path}`;
                        elements.push(new JSDoc(temp, jsdoc, position, charger));
                    }
                }
            }

            setObj();
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



class HTMLTag {
    constructor(attributes, charger, parent) {
        if(Object.keys(attributes).length) {
            if(attributes.src) {
                charger.stash(()=>{
                    this.origin = FileEntry.getFromPath(charger, attributes.src, parent.path);
                })
            }

            this.attributes = attributes;
        }
    }
}
class ScriptTag extends HTMLTag {
    static read(content, charger, parent) {
        const matches = content.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi);

        let arr = [];
        for (const [_, rawAttributes, content] of matches) {
            const attributes = Object.fromEntries(
                [...rawAttributes.matchAll(
                    /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s]+)))?/g
                )].map(([, key, double, single, unquoted]) => [
                    key,
                    double ?? single ?? unquoted ?? true
                ])
            );

            if(attributes.type != "importmap") {
                arr.push(new ScriptTag(content, attributes, charger, parent));
            }
        }

        return arr;
    }
    constructor(content, attributes, charger, parent) {
        super(attributes, charger, parent);

        if (content.trim()) {
            this.data = getJsElements(content, this.path, charger);
        }
    }
}

class Path {
    constructor(fullPath) {
        this.name = path.basename(fullPath);
        this.path = fullPath;
    }
}

class FileEntry extends Path {
    static getFromPath = (charger, filePath, parentPath) => {
        const unnacessible = (message, data) => ({
            unnacessible: true,
            message,
            data
        })
        if(["http", "file", "blob"].find(e => filePath.startsWith(e))) return unnacessible("external");
        parentPath = path.dirname(parentPath);
        filePath = path.normalize(filePath);
        const endPath = path.normalize(
            path.join(
                parentPath,
                filePath
            )
        );

        const find = charger.files.find(file => file.path === endPath);
        if (find) return new Getter(find);
        else return unnacessible("not found resolution", `${parentPath} -> ${filePath}`);
    }
    constructor(path, charger) {
        super(path);

        if (["js", "cjs"].includes(path.toLowerCase().split(".").pop()))
            this.type = "js";
        else if (path.toLowerCase().endsWith(".html"))
            this.type = "html";

        const readFile = fs.readFileSync(path, "utf-8");


        let description = "";
        if (["js", "cjs"].includes(this.type)) {
            description = readFile.match(
                /^\s*\/\/\s*@fileSummary\s*(.*?)\s*$/m
            )?.[1]?.trim();

            if (!description) {
                description = readFile.match(
                    /\/\*\s*@fileSummary\s*([\s\S]*?)\s*\*\//
                )?.[1]?.trim();
            }
        }

        else if (this.type === "html") {
            description = readFile.match(
                /<!--\s*@fileSummary\s*([\s\S]*?)\s*-->/
            )?.[1]?.trim();
        }

        if (description) {
            if(description.trim().startsWith(":"))
                description = description.trim().slice(1);

            description = description.trim();

            let defining = false;
            let obj = {};
            this.summary = "";

            const entries = Object.entries(description.split("\n"));
            for (let [index, line] of entries) {
                line = line.trim();

                if (!defining) {
                    if (line.startsWith("@type")) {
                        obj.name = line.replace("@type", "").trim();
                        defining = true;
                    } else if(line.startsWith("@copy")) {
                        obj.copyScheme = line.replace("@copyScheme", "").trim();
                    } else {
                        this.summary += line + "\n";
                    }
                } else {                    
                    if (line === "@end") {
                        new JSDoc.Type(obj, charger);
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
                        new JSDoc.Type(obj, charger);
                }
            }

            this.summary = this.summary.trim();
        }

        if (this.type == "js")
            this.data = getJsElements(readFile, this.path, charger);
        else if (this.type == "html") {
            this.scripts = ScriptTag.read(readFile, charger, this);
        }

        this.id = genId();
        charger.files.push(this);
    }
}

class Directory extends Path {
    constructor(fullpath, ignorePath = [], ignoreStartsWith = [], fileTypes = [], charger) {
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
            .map(file => objectify(join(file), ignorePath, ignoreStartsWith, fileTypes, charger))
            .filter(file => !(file instanceof Directory) || file.files.length > 0);
    }
}


export const objectify = (filePath = "./", ignorePath, ignoreStartsWith, fileTypes, charger) => {
    if (fs.statSync(filePath).isFile()) return new Getter(new FileEntry(filePath, charger), filePath, "path");

    return new Directory(filePath, ignorePath, ignoreStartsWith, fileTypes, charger);
};


const chargerStructure = () => {
    const charger = {
        types: [],
        references: [],
        definitions: [],
        files: [],
    }
    const filterIgnore = () => Object.entries(charger);

    const ignoreKeys = {
        stash: (f) => ignoreKeys.stashes.push(f),
        stashes: [],
        onNonIgnore: (callback, type = "forEach") => filterIgnore()[type](callback),
        search: (origin) => {
            if(!origin.isGetter) return origin;
            
            for(const [_, check] of filterIgnore()) {
                const find = check.find(e => e.id == origin.for);
                if(find) return find;
            }
        }
    }
    ignoreKeys.ignoreKeys = [...Object.keys(ignoreKeys), "ignoreKeys"];
            

    return {
        ...charger,
        ...ignoreKeys,
    };
};


const chargerStructurePath = path.join(path.dirname(fileURLToPath(import.meta.url)), "chargerStructure");
const generalComment = `\n@fileSummary
This file is generated by "generateSchema.js" from the function chargerStructure().`;
const moduleComment = `${generalComment}
It is a module to export the chargerStructure object.\n`
fs.writeFileSync(chargerStructurePath+".cjs",  `/*${moduleComment}*/\nexports.chargerStructure = ${chargerStructure.toString()}`);
fs.writeFileSync(chargerStructurePath+".mjs",  `/*${moduleComment}*/\nexport const chargerStructure = ${chargerStructure.toString()}`);
fs.writeFileSync(chargerStructurePath+".js",  `/*${generalComment}
Defines the chargerStructure object.
Intended for use in a browser.
*/\nconst chargerStructure = ${chargerStructure.toString()}`);



const generateApiSchema = (dir = "./", ignorePath, ignoreStartsWith, fileTypes) => {
    const charger = {
        ...chargerStructure(),
    }

    const schema = objectify(dir, ignorePath, ignoreStartsWith, fileTypes, charger);

    charger.stashes.forEach(f=>f());
    charger.ignoreKeys.forEach(k=>delete charger[k]);

    return {
        ...charger,
        schema,
    };
}

export default generateApiSchema;
class JSData {
    constructor(obj) {
        this.name = obj.name;
        this.type = obj.type;
        this.declarationType = obj.declarationType;
        this.static = obj.static;
        if(Array.isArray(obj.classBody)) 
            this.classBody = obj.classBody.filter(Boolean).map(b => new JSData(b));

        this.jsdoc = new JSDoc(obj.jsdoc);
    }
}


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
    constructor(obj) {
        Object.entries(obj).forEach(([key, value]) => {
            if(JSDoc.typeTags.includes(key)) value = new Type(value);
            if(JSDoc.arrayTags[key]) value = value.map(v => new UseType(v));

            this[key] = value;
        });

    }
}



class UseType {
    constructor(obj) {
        Object.entries(obj).forEach(([key, value]) => {
            if(key == "type") value = new Type(value);
            this[key] = value;
        });
    }
}

class Type {
    static instances = [];
    constructor(obj) {
        const find = Type.instances.find(type => type.name === obj.name);
        if(find) return find;

        Object.entries(obj).forEach(([key, value]) => {
            this[key] = value;
        });

        Type.instances.push(this);
    }
}

class Script {
    constructor(obj) {
        this.jsData = obj.map(data => new JSData(data));
    }
}


class FileEntry {
    constructor(obj) {
        this.name = obj.name;
        this.path = obj.path;
        this.type = obj.type;
        this.description = obj.description;

        if(obj.type === "js" && Array.isArray(obj.data))
            this.data =  obj.data.map(data => new JSData(data));
        if(obj.type === "html" && Array.isArray(obj.scripts))
            this.scripts =  obj.scripts.map(data => new Script(data));
    }
}
class Directory {
    constructor(obj) {
        this.name = obj.name;
        this.path = obj.path;
        this.files = obj.files.map(file => parse(file));

    }
}

const parse = (obj) => {
    if(typeof obj !== "object" || Array.isArray(obj)) throw new Error("Not an object");

    if(Array.isArray(obj.files))
        return new Directory(obj);

    if(["js", "html"].includes(obj.type))
        return new FileEntry(obj);

    if(obj.types) 
        return {
            types: obj.types.map(type => new Type(type)),
            schema: new Directory(obj.schema),
        }
}
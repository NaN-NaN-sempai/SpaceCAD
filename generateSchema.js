/* 
@fileSummary
File used to define the types for the SpaceCAD Project API schema and generate the output "API.json" ans "API_Pending.json" file.

@type HTMLElement
@description HTML element
@end

@type HTMLInputElement
@description HTML input element
@extends HTMLElement
@end


*/


import {chargerStructure} from "./lib/generateSchema/chargerStructure.mjs";
import generateApiSchema from "./lib/generateSchema/generateSchema.js";
import fs from "fs";


const schema = generateApiSchema("./", [
    "node_modules",
    "build",
    "threeAddons"
], ["."], [".js", ".cjs", ".html"]);




const schemify = (obj, charger) => {
    charger = charger || chargerStructure();

    if(Array.isArray(obj.files) && !obj.types) {
        obj.files = obj.files.map(e => schemify(e, charger))
        .filter(Boolean);

        if(obj.files.length === 0)
            return null;

        obj.name=undefined;

        return obj;
    }

    if(obj.type == "js") {
        obj.data = obj.data.map(e => schemify(e, charger))
        .filter(Boolean);

        if(!obj.data || obj.data.length === 0)
            return null;

        obj.name=undefined;

        return obj;
    }

    if(obj.type == "html") {
        obj.scripts = obj.scripts.map(e => {
            const script = schemify(e, charger);

            if(Object.keys(script).length > 0)
                return script
        })
        .filter(Boolean);

        if(obj.scripts.length === 0)
            return null;

        obj.name=undefined;

        return obj;
    }

    if(obj.isGetter) {
        obj = charger.search(obj);

        if(obj.jsdoc && Object.keys(obj.jsdoc).length > 0)
            return null;

        return schemify(obj, charger);
    }

    if(Object.keys(charger).find(k => Object.keys(obj).includes(k))) {
        charger.onNonIgnore(([k]) => {
            if(Array.isArray(charger[k]))
            obj[k].forEach(e => charger[k].push(e));
        })   
        
        const types = obj.types.filter(t => !t.description && !t.summary);
        const ret = {
            types,
            schema: schemify(obj.schema, charger),
        }

        for(const callback of charger.stashes) {
            callback();
        }
        
        return ret;
    }

    if(Array.isArray(obj)) {
        obj = obj.map(e => schemify(e, charger))
        .filter(Boolean);
        
        if(obj.length === 0)
            return null;

        return obj;
    }

    Object.entries(obj)
    .forEach(([k, v]) => {
        if(typeof v === "object") {
            const val = schemify(v, charger);
            if(k == "jsdoc" && Object.keys(val).length != 0)
                delete obj[k];
            else if(val)
                obj[k] = val;
            else
                delete obj[k];
        }
    });
    
    return obj;
}

if(1)
fs.writeFileSync("API.json", JSON.stringify(schema, null, 4));
console.log("API.json generated");

if(1)
fs.writeFileSync("API_Pending.json", JSON.stringify(schemify(schema), null, 4));
console.log("API_Pending.json generated");

/* 
File Description: File used to define the types for the SpaceCAD Project API schema and generate the output "apiSchema.json" file.

@type HTMLElement
@description HTML element
@end

@type HTMLInputElement
@description HTML input element
@extends HTMLElement
@end


*/



import generateApiSchema from "./lib/generateSchema/generateSchema.js";
import fs from "fs";


const schema = generateApiSchema("./", [
    "node_modules",
    "build",
    "threeAddons"
], ["."], [".js", ".html"]);


const objIsEmpty = (obj) => Object.keys(obj).length === 0;
const traverser = (obj, parent) => {
    let ret = {};

    if(obj.isType) {
        if(!obj.description && !obj.summary) {
            ret.name = obj.name;
        }
        else 
            return null;
    }


    if(obj.types)
        ret.types = obj.types.map(type => traverser(type, obj)).filter(Boolean);

    if(obj.schema)
        ret.schema = traverser(obj.schema, obj);


    if(obj.files) {
        ret.name = obj.name;
        if(obj.files.length) {
            ret.files = obj.files.map(file => traverser(file, obj)).filter(Boolean);

            if(!ret.files.length)
                return null;
        }
        else
            return null;
    }

    if(["js", "html"].includes(obj.type)) {
        ret.name = obj.name;
        ret.description = obj.description;

        if(obj.data) {
            if(obj.data.length)
                ret.data = obj.data.map(data => traverser(data, obj)).filter(Boolean);
            else
                return null;
        }
        if(obj.scripts) {
            if(obj.scripts.length)
                ret.scripts = obj.scripts.map(data => data.map(script => traverser(script, obj)).filter(Boolean));
            else
                return null;
        }
    }

    if(obj.jsdoc) {
        ret.name = obj.name;
        ret.type = obj.type;

        if(obj.type == "function" && obj.name == "constructor") 
            return null;

        if((obj.classBody || []).length) {
            const classBody = obj.classBody.map(data => traverser(data, obj)).filter(Boolean);
            if(classBody.length)
                ret.classBody = classBody;
        }

        if(objIsEmpty(obj.jsdoc)) {
            Object.entries(obj).forEach(([key, value]) => {
                if(key != "jsdoc" && key != "classBody") ret[key] = value;
            }) 
            
        } 
        
        if(!objIsEmpty(obj.jsdoc) && !(ret.classBody || []).length) {
            return null;
        }
    }


    return ret;
}




fs.writeFileSync("API.json", JSON.stringify(schema, null, 4));
console.log("API.json generated");

fs.writeFileSync("API_Pending.json", JSON.stringify(traverser(schema), null, 4).replace(/\{\s*/g, "{ ").replace(/\[\s*/g, "[ "));
console.log("API_Pending.json generated");

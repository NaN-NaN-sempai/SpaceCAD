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

fs.writeFileSync("API.json", JSON.stringify(generateApiSchema("./", [
    "node_modules",
    "build",
    "threeAddons"
], ["."], [".js", ".html"]), null, 4));

console.log("API.json generated");
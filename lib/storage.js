import fs from "fs";

const filePath = "./lib/.storagedata.js";

const write = (obj) => {
    fs.writeFileSync(filePath, 
            `let storedata = ${serialize(obj)};\n\nexport default storedata;`
    );
}

if(!fs.existsSync(filePath))
    write({});


const { default: storedata } = await import("./.storagedata.js");


const serialize = value => {
    if (typeof value === "function")
        return value.toString();

    if (value === undefined)
        return "undefined";

    if (typeof value === "string")
        return JSON.stringify(value);

    if (typeof value === "number" || typeof value === "boolean")
        return String(value);

    if (Array.isArray(value))
        return `[${value.map(serialize).join(", ")}]`;

    if (value && typeof value === "object") {
        return `{${Object.entries(value)
            .map(([key, value]) =>
                `${JSON.stringify(key)}: ${serialize(value)}`
            )
            .join(", ")}}`;
    }

    return "null";
};

const proxies = new WeakMap();

const proxify = target => {
    if (!target || typeof target !== "object")
        return target;

    if (proxies.has(target))
        return proxies.get(target);

    const proxy = new Proxy(target, {
        get(target, key) {
            if (key === "clear")
                return () => write({});

            return proxify(target[key]);
        },

        set(target, key, value) {
            if (key === "clear")
                return true;

            target[key] = value;
            write(storedata);

            return true;
        }
    });

    proxies.set(target, proxy);

    return proxy;
};

export default proxify(storedata);
const javaScriptHighObjectNotation = {
    stringify(object, replacer = null, space = 4) {
        const seen = new WeakSet();

        const encode = (value, path = "$") => {
            if (value === null)
                return { type: "null" };

            const type = typeof value;

            if (type === "string")
                return { type: "string", value };

            if (type === "number") {
                if (Number.isNaN(value))
                    return { type: "number", value: "NaN" };

                if (value === Infinity)
                    return { type: "number", value: "Infinity" };

                if (value === -Infinity)
                    return { type: "number", value: "-Infinity" };

                return { type: "number", value };
            }

            if (type === "boolean")
                return { type: "boolean", value };

            if (type === "undefined")
                return { type: "undefined" };

            if (type === "bigint")
                return {
                    type: "bigint",
                    value: value.toString()
                };

            if (type === "symbol")
                return {
                    type: "symbol",
                    value: Symbol.keyFor(value) ?? value.description
                };

            if (type === "function")
                return {
                    type: "function",
                    value: value.toString()
                };

            // Circular
            if (seen.has(value))
                return {
                    type: "circular"
                };

            seen.add(value);

            if (value instanceof Date)
                return {
                    type: "date",
                    value: value.toISOString()
                };

            if (value instanceof RegExp)
                return {
                    type: "regexp",
                    value: value.toString()
                };

            if (Array.isArray(value)) {
                return {
                    type: "array",
                    value: value.map((item, index) =>
                        encode(item, `${path}[${index}]`)
                    )
                };
            }

            const properties = {};

            let current = value;

            while (current) {
                for (const key of Reflect.ownKeys(current)) {
                    if (key in properties)
                        continue;

                    const descriptor =
                        Object.getOwnPropertyDescriptor(current, key);

                    const property = {
                        enumerable: descriptor.enumerable,
                        configurable: descriptor.configurable
                    };

                    // Getter
                    if (descriptor.get) {
                        property.get = {
                            type: "getter function",
                            value: descriptor.get.toString()
                        };
                    }

                    // Setter
                    if (descriptor.set) {
                        property.set = {
                            type: "setter function",
                            value: descriptor.set.toString()
                        };
                    }

                    // Propriedade normal
                    if ("value" in descriptor) {
                        property.value = encode(
                            descriptor.value,
                            `${path}.${String(key)}`
                        );

                        property.writable = descriptor.writable;
                    }

                    properties[key] = property;
                }

                current = Object.getPrototypeOf(current);
            }

            return {
                type: "object",
                value: properties
            };
        };

        return JSON.stringify(encode(object), replacer, space);
    },
    parse(str) {
        const data = typeof str === "string"
            ? JSON.parse(str)
            : str;

        const decode = (data) => {
            if (!data)
                return undefined;

            switch (data.type) {

                case "null":
                    return null;

                case "string":
                case "boolean":
                    return data.value;

                case "number":
                    if (data.value === "NaN")
                        return NaN;

                    if (data.value === "Infinity")
                        return Infinity;

                    if (data.value === "-Infinity")
                        return -Infinity;

                    return data.value;

                case "undefined":
                    return undefined;

                case "bigint":
                    return BigInt(data.value);

                case "symbol":
                    return Symbol.for(data.value);

                case "function":
                    return eval(`(${data.value})`);

                case "getter function":
                case "setter function": {
                    const code = data.value.replace(/^(get|set)\s+/, "");

                    return eval(`(function ${code})`);
                }
                
                case "date":
                    return new Date(data.value);

                case "regexp": {
                    const match = data.value.match(/^\/(.*)\/([dgimsuvy]*)$/);

                    if (!match)
                        return new RegExp(data.value);

                    return new RegExp(match[1], match[2]);
                }

                case "array":
                    return data.value.map(decode);

                case "circular":
                    return undefined;

                case "object": {
                    const object = {};

                    for (const key of Reflect.ownKeys(data.value)) {
                        const property = data.value[key];

                        const descriptor = {
                            enumerable: property.enumerable ?? false,
                            configurable: property.configurable ?? false
                        };

                        if (property.value !== undefined) {
                            descriptor.value = decode(property.value);
                            descriptor.writable = property.writable ?? false;
                        }

                        if (property.get)
                            descriptor.get = decode(property.get);

                        if (property.set)
                            descriptor.set = decode(property.set);

                        Object.defineProperty(
                            object,
                            key,
                            descriptor
                        );
                    }

                    return object;
                }

                default:
                    throw new Error(
                        `JSHON: Unknown type "${data.type}"`
                    );
            }
        };

        return decode(data);
    }
}

export default javaScriptHighObjectNotation;
const stash = (getter, origin, key, charger, counter = 0) => {
    const set = (value) => {

        if(Array.isArray(value) || typeof value === "object")
        Object.entries(origin[key])
        .forEach(([k, v]) => {
            value[k] = schemify(v, charger)
        });

        origin[key] = value;

    }
    
    if(counter > 10) return set("not found after stashes");
    
    if(!getter.isGetter) set(getter);

    let find = charger.search(getter);

    if(find) set(find);
    else charger.stash(() => {
        stash(getter, origin, key, charger, counter + 1)
    });
}

const schemifyRaw = (obj, charger) => {
    charger = charger || chargerStructure();

    if(Array.isArray(obj.files) && !obj.types) {
        obj.files.forEach((e, i, arr) => {
            if(e.type == "js")
                return e.data.forEach(e => stash(e, obj.files, i, charger));
    
            else if(e.type == "html")
                return e.scripts.forEach(e => stash(e, arr, i, charger));

            else if(e.isGetter)
                return stash(e, obj.files, i, charger);

             stash(schemify(e, charger), obj.files, i, charger);
        })

        return obj
    }

    if(obj.isGetter) return charger.search(obj);

    if(Object.keys(charger).find(k => Object.keys(obj).includes(k))) {
        charger.onNonIgnore(([k]) => {
            if(Array.isArray(charger[k]))
            obj[k].forEach(e => charger[k].push(e));
        })   
        
        const ret = {
            schema: schemify(obj.schema, charger),
        }

        for(const callback of charger.stashes) {
            callback();
        }
        
        return ret;
    }

    Object.entries(obj).forEach(([k, v]) => {
        if(typeof v === "object" && !Array.isArray(v)) {
            obj[k] = schemify(v, charger);
        }
    });
    
    return obj;
}


const proxyGetter = (obj, charger, stack) => {
    const find = charger.search(obj);

    if (!find)
        return new Proxy({}, {
            get(_, key) {
                return schemify(
                    proxyGetter(obj, charger, stack),
                    charger,
                    stack
                )[key];
            }
        });

    if (stack.has(find))
        return obj;

    return schemify(find, charger, stack);
};

const schemify = (obj, charger = chargerStructure(), stack = new Set()) => {
    if (obj?.isGetter)
        return proxyGetter(obj, charger, stack);

    if (typeof obj !== "object" || obj === null)
        return obj;

    if (stack.has(obj))
        return obj;

    stack.add(obj);

    try {
        if (Array.isArray(obj.files) && !obj.types) {

            obj.files = obj.files.map((e, i, arr) => {
                if (e.type == "js") {
                    return e.data.map(e =>
                        schemify(e, charger, stack)
                    );
                }

                else if (e.type == "html") {
                    return e.scripts.map(e =>
                        schemify(e, charger, stack)
                    );
                }

                else if (e.isGetter) {
                    return proxyGetter(e, charger, stack);
                }

                return schemify(e, charger, stack);
            });

            Object.defineProperties(obj, {
                byName: {
                    value: (name) => {
                        const path = name.split("/");

                        let query;

                        for (const loc of path) {
                            if (!query) query = obj.files.find(e => e.name == loc);
                            else query = query.files.find(e => e.name == loc);

                            if (!query) return null;
                        }

                        return query;
                    },
                    enumerable: false,
                    configurable: true,
                    writable: true,
                },

            });

            return obj;
        }


        if (Object.keys(charger).find(
            k => Object.keys(obj).includes(k)
        )) {

            charger.onNonIgnore(([k]) => {
                if (Array.isArray(charger[k]))
                    if(Array.isArray(obj[k]))
                    obj[k].forEach(e =>
                        charger[k].push(e)
                    );
            });

            const ret = {
                schema: schemify(
                    obj.schema,
                    charger,
                    stack
                ),
                types: schemify(
                    obj.types,
                    charger,
                    stack
                ),
                references: schemify(
                    obj.references,
                    charger,
                    stack
                ),
                definitions: schemify(
                    obj.definitions,
                    charger,
                    stack
                ),
                files: schemify(
                    obj.files,
                    charger,
                    stack
                ),
            };

            for (const callback of charger.stashes)
                callback();

            return ret;
        }


        Object.entries(obj).forEach(([k, v]) => {

            if (typeof v === "object" && v !== null) {
                obj[k] = schemify(
                    v,
                    charger,
                    stack
                );
            }

        });

        return obj;

    } finally {
        stack.delete(obj);
    }
};
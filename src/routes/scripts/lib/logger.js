class Logger {
    static stringify = (value, seen = new WeakSet(), keyNow = "") => {
        if (value === undefined || value === null)
            return {
                type: value === null ? "null" : "undefined",
                value: String(value)
            };
        
        if (typeof value === "string")
            return {
                type: "string",
                value: `"${value}"`
            };

        if (typeof value == "number")
            return {
                type: "number",
                value
            };

        if (typeof value == "boolean")
            return {
                type: "boolean",
                value
            };
        
        if(typeof value == "function")
            return {
                type: "function",
                value: value.toString()
            };


        if(typeof value == "object") {
            if (seen.has(value)) {
                return {
                    type: "reference",
                    value: `[Circular "${keyNow}"]`,
                    raw: value
                }
            }
            seen.add(value);

            if(Array.isArray(value))
                return {
                    type: "array",
                    value: value.map((v, i) => Logger.stringify(v, seen, keyNow + "[" + i + "]"))
                };

            return {
                type: "object",
                value: Object.entries(value).map(([key, value]) => [key, Logger.stringify(value, seen, keyNow + "." + key)])
            };
        }

        return {
            type: "unrecognized",
            value: String(value)
        };
    };
    constructor(dom, max = 1000, beforePush = () => {}) {
        this.dom = dom;
        this.logList = [];
        this.max = max;
        this.beforePush = beforePush;
        
        const ignore = [
            "beforePush",
            "logList",
            "dom",
            "max"
        ];

        
        

        const generateBody = (type, message, stack) => {
            const obj = typeof this.beforePush === "function" ?
                this.beforePush({type, message, stack, read: false}, this.logList) :
                {type, message, stack, read: false};

            this.logList.push(obj);
            if(this.logList.length > this.max)
                this.logList.pop();

            if(!this.dom instanceof HTMLElement) return;

            const body = document.createElement("div");
            body.classList.add("item");
            body.classList.add(type);

            const messageDom = document.createElement("div");
            messageDom.classList.add("message");
            const arrayMessage = 2;

            const treeBuilder = ({type, value, raw}, parent, firstOpen = true) => {
                if (["null", "undefined"].includes(type)) {
                    parent.append(createElement("span", e => {
                        e.classList.add("stringified", "undefined");
                        e.title = type;
                        e.innerText = value;
                    }));
                } else if (type == "array") {
                    parent.append(
                        createElement("div", e => {
                            e.classList.add("stringified", "tabify");
                            e.title = type;
                            
                            e.classList.toggle("objMinified", !firstOpen);

                            const setBody = () => {
                                const pre = createElement("span", e => {
                                    e.classList.add("stringified", "objectChar");
                                    e.innerHTML = "["
                                });
                                const post = createElement("span", e => {
                                    e.classList.add("stringified", "objectChar");
                                    e.innerHTML = "]"
                                });

                                e.innerHTML = "";
                                e.append(pre);
                                if(!e.classList.contains("objMinified")) {
                                    value.forEach((v,i) => {
                                        treeBuilder(v, e, false);

                                        if(i !== value.length - 1)
                                            e.append(createElement("span", e => {
                                                e.innerHTML = ",";
                                            }), createElement("br"));
                                    });
                                    
                                    if(value.length == 0)
                                        e.append(createElement("span", e => {
                                            e.style.marginLeft = "20px"
                                            e.classList.add("stringified", "objectKey");
                                            e.title = "array is empty";
                                            e.innerText = "~empty";
                                        }));
                                } else {
                                    e.append(createElement("span", e=>e.innerHTML="..."));
                                }
                                e.append(post);
                            }


                            setBody();
                        

                            e.on("click", (evt) => {
                                evt.stopPropagation();
                                e.classList.toggle("objMinified");
                                setBody();
                            });
                        })
                    );

                } else if (type == "object") {
                    parent.append(
                        createElement("div", e => {
                            e.classList.add("stringified", "tabify");
                            e.classList.toggle("objMinified", !firstOpen);
                            e.title = type;

                            const setBody = () => {
                                const pre = createElement("span", e => {
                                    e.classList.add("stringified", "objectChar");
                                    e.innerHTML = "{"
                                });
                                const post = createElement("span", e => {
                                    e.classList.add("stringified", "objectChar");
                                    e.innerHTML = "}"
                                });

                                e.innerHTML = "";

                                e.append(pre);
                                if(!e.classList.contains("objMinified")) {
                                    e.append(createElement("br"));
                                    value.forEach((v,i) => {
                                        if(v != undefined) {

                                            e.append(createElement("span", e => {
                                                e.style.marginLeft = "20px"
                                                e.classList.add("stringified", "objectKey");
                                                e.title = "object property";
                                                e.innerText = v[0].includes(" ")? `"${v[0]}"` : v[0];
                                            }));
    
                                            e.append(createElement("span", e => {
                                                e.classList.add("stringified", "objectChar");
                                                e.innerHTML = ":";
                                            }));
                                            treeBuilder(v[1], e, false);
                                        }
                                        
                                        if(i !== value.length - 1)
                                            e.append(createElement("span", e => {
                                                e.classList.add("stringified", "objectChar");
                                                e.innerHTML = ",";
                                            }), createElement("br"));
                                    });
                                    if(value.length == 0)
                                        e.append(createElement("span", e => {
                                            e.style.marginLeft = "20px"
                                            e.classList.add("stringified", "objectKey");
                                            e.title = "object value is empty";
                                            e.innerText = "~empty";
                                        }));
                                    e.append(createElement("br"));
                                } else {
                                    e.append(createElement("span", e=>e.innerHTML="..."));
                                }
                                e.append(post);

                            }

                            setBody();

                            e.on("click", (evt) => {
                                evt.stopPropagation();
                                e.classList.toggle("objMinified");
                                setBody();
                            })
                        })
                    );

                } else if (type == "reference") {
                    parent.append(createElement("span", e => {
                        e.classList.add("stringified", type);
                        e.innerText = value;
                        e.title = "circular reference";

                        let open = false;
                        e.on("click", (evt) => {
                            evt.stopPropagation();
                            if(open) {
                                e.innerHTML = value;
                            } else {
                                treeBuilder(Logger.stringify(raw), e);
                            }
                            open = !open;
                        });
                    }));
                    
                } else if (type == "function") {
                    parent.append(createElement("span", e => {
                        e.classList.add("stringified", "tabify", "function");
                        e.innerText = "(function)";
                        e.title = "function";

                        let open = firstOpen;
                        const setBody = () => {
                            if(!open) {
                                e.innerHTML = "(function)";
                            } else {
                                e.innerHTML = value;
                            }
                            open = !open;
                        }

                        setBody();

                        e.on("click", (evt) => {
                            evt.stopPropagation();
                            setBody();
                        });
                    }))
                    
                } else {
                    parent.append(createElement("span", e => {
                        e.classList.add("stringified", type);
                        e.title = type;
                        e.innerText = value;
                    }));
                }
            }

            
            const stringified = message.map(e => Logger.stringify(e));

            stringified.forEach(v => treeBuilder(v, messageDom));
                

            stack = stack != undefined ? stack : new Error().stack;
            stack = stack.slice(6).replaceAll(location.href, "")
            .split("\n").slice(2).join("\n");

            let fileName = (stack.indexOf(" (") != -1 ?
                stack.split("\n")[0].split(" (")[1] : 
                "<" +stack.split("\n")[0].split(" <")[1] )
                .replace(":","REPLACEHERE").split(":")[0].replace("REPLACEHERE",":");
            fileName = fileName.startsWith(":")? "<anonymous>"+fileName : fileName;

            const fileNameDom = document.createElement("div");
            fileNameDom.classList.add("fileName");
            fileNameDom.innerText = fileName;

            const stackDom = document.createElement("div");
            stackDom.classList.add("stack");
            stackDom.innerText = stack;

            body.title = fileName + "\n" + stack;

            body.appendChild(fileNameDom);
            body.appendChild(messageDom);
            body.appendChild(stackDom);
            this.dom.appendChild(body);

            if(this.dom.children.length > this.max)
                this.dom.children[this.dom.children.length - 1].remove();
        }
        
        return new Proxy(this, {
            get(target, key, receiver) {
                if (typeof key === "symbol")
                    return Reflect.get(target, key, receiver);
                
                if (ignore.includes(key))
                    return Reflect.get(target, key, receiver);

                if(key == "clear")
                    return function() {
                        target.logList = [];
                        target.dom.innerHTML = "";
                    };

                if(key == "og")
                    return console;

                const stack = new Error().stack;
                return function(...args) {
                    const stack = new Error().stack;

                    generateBody(key, args, stack);
                    return Reflect.apply(console[key], console, args);
                };
            },
            set(target, key, value) {
                if(ignore.includes(key)) {
                    if(key == "dom" && value instanceof HTMLElement)
                        return target.dom = value;
                    else if(key == "dom") {
                        generateBody("error", `"${key}" property must be an HTMLElement.`);
                        return console.error(`"${key}" property must be an HTMLElement.`);
                    }

                    if(key == "max" && typeof value === "number")
                        return target.max = value;
                    else if(key == "max") {
                        generateBody("error", `"${key}" property must be a number.`);
                        return console.error(`"${key}" property must be a number.`);
                    }

                    if(key == "beforePush" && typeof value === "function")
                        return target.beforePush = value;
                    else if(key == "beforePush") {
                        generateBody("error", `"${key}" property must be a function.`);
                        return console.error(`"${key}" property must be a function.`);
                    }

                    if(key == "logList" && Array.isArray(value))
                        return target.logList = value;
                    else if(key == "logList") {
                        generateBody("error", `"${key}" property must be an Array.`);
                        return console.error(`"${key}" property must be an Array.`);
                    }
                        
                }          
            }
        });
    }
}
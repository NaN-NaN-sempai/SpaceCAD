class Logger {
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

        
        const stringify = value => {
            if (typeof value === "string")
                return {
                    type: "string",
                    value
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

            try {
                const result = JSON.stringify(value);

                return result === undefined
                    ? {
                        type: "undefined",
                        value: String(value)
                    }
                    : {
                        type: "object",
                        value: result
                    };
            } catch {
                return {
                    type: "string",
                    value: String(value)
                };
            }
        };

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
            const arrayMessage = Array.isArray(message) ?
                message.map(stringify) :
                [stringify(message)];

            arrayMessage.forEach(({type, value}) => {
                const valueDom = document.createElement("span");
                valueDom.classList.add("stringified", type);

                valueDom.innerHTML = value;
                messageDom.appendChild(valueDom);
            });

                

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
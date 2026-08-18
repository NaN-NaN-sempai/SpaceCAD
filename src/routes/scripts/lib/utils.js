// UTILS

[
    "Object",
    "Function",
    "String",
    "Number",
    "Boolean",
    "BigInt",
    "Symbol",
    "Array",
    "Date",
    "RegExp",
    "Map",
    "Set",
    "WeakMap",
    "WeakSet",
    "Promise",
    "Error",
    "EvalError",
    "RangeError",
    "ReferenceError",
    "SyntaxError",
    "TypeError",
    "URIError",
    "AggregateError",

    "ArrayBuffer",
    "SharedArrayBuffer",
    "DataView",

    "Uint8Array",
    "Uint8ClampedArray",
    "Uint16Array",
    "Uint32Array",
    "Int8Array",
    "Int16Array",
    "Int32Array",
    "Float32Array",
    "Float64Array",
    "BigInt64Array",
    "BigUint64Array",

    "URL",
    "URLSearchParams",
    "WeakRef",
    "FinalizationRegistry",

    "Node",
    "Element",
    "HTMLElement",
    "SVGElement",
    "Document",
    "DocumentFragment",
    "Text",
    "Comment",

    "HTMLDocument",
    "HTMLHtmlElement",
    "HTMLHeadElement",
    "HTMLBodyElement",
    "HTMLDivElement",
    "HTMLSpanElement",
    "HTMLParagraphElement",
    "HTMLAnchorElement",
    "HTMLImageElement",
    "HTMLVideoElement",
    "HTMLAudioElement",
    "HTMLCanvasElement",
    "HTMLInputElement",
    "HTMLButtonElement",
    "HTMLFormElement",
    "HTMLLabelElement",
    "HTMLSelectElement",
    "HTMLOptionElement",
    "HTMLTextAreaElement",
    "HTMLTableElement",
    "HTMLTableRowElement",
    "HTMLTableCellElement",

    "Event",
    "CustomEvent",
    "UIEvent",
    "MouseEvent",
    "PointerEvent",
    "KeyboardEvent",
    "WheelEvent",
    "InputEvent",
    "FocusEvent",
    "DragEvent",
    "TouchEvent",

    "XMLHttpRequest",
    "WebSocket",
    "EventSource",

    "Request",
    "Response",
    "Headers",
    "FormData",

    "Blob",
    "File",
    "FileList",
    "FileReader",

    "DOMParser",
    "XMLSerializer",
    "MutationObserver",
    "ResizeObserver",
    "IntersectionObserver",

    "CanvasRenderingContext2D",
    "OffscreenCanvas",
    "ImageData",
    "ImageBitmap",

    "MediaStream",
    "MediaStreamTrack",
    "MediaRecorder",

    "Worker",
    "MessagePort",
    "MessageChannel",

    "History",
    "Location",
    "Storage",

    "Crypto",
    "CryptoKey",

    "Geolocation",
    "GeolocationPosition",
    "GeolocationCoordinates",

    "Animation",
    "AnimationEffect",
    "KeyframeEffect",

    "CustomElementRegistry",
    "ShadowRoot",

    "Performance",
    "PerformanceEntry",
    "PerformanceObserver",

    "Range",
    "Selection",

    "CSSStyleDeclaration",
    "CSSRule",
    "CSSStyleRule",
    "CSSMediaRule",

    "TextEncoder",
    "TextDecoder",

    "AbortController",
    "AbortSignal",

    "ReadableStream",
    "WritableStream",
    "TransformStream",
    "ReadableStreamDefaultReader",
    "ReadableStreamDefaultWriter",

    "SubtleCrypto"
]
.map(name => globalThis[name]).filter(Boolean).filter(type => typeof type === "function")
.forEach(proto => {
    Object.defineProperties(proto.prototype, {
        typeis: {
            get() {
                const object = this;

                return new Proxy(function () {
                    return typeof object.valueOf();
                }, {
                    get(target, key) {
                        if (key === "array")
                            return Array.isArray(object);

                        return typeof object.valueOf() === key;
                    }
                });
            }
        }
    });
})

Object.defineProperties(Array.prototype, {
    populate: {
        get: function (value) {
            let allNumber = this.map(e => typeof e == "number").reduce((a, b) => a && b, true);
            if(!allNumber) {
                console.warn("Array must only contain numbers to be populated");
                return this;
            }
            if(this.length < 2) {
                console.warn("Array must have at least 2 values to be populated");
                return this;
            }

            const array = [];

            const generate = (from, to, ignoreFirst = false) => {
                const arr = [];

                if(from > to) 
                    for (let i = from; i >= to; i--) 
                        arr.push(i);
                else 
                    for (let i = from; i <= to; i++) 
                        arr.push(i);

                if(ignoreFirst)
                    arr.shift();

                return arr;
            }

            this.forEach((v, i) => {
                if(this[i + 1] == undefined) return;
                const arr = generate(this[i], this[i+1], i != 0);
                array.push(...arr);
            })

            return array;
        },
        set: () => {}
    }
});
Object.defineProperties(Object.prototype, {
    jshon: {
        get: function (value) {
            return JSHON.stringify(this);
        },
        set: () => {}
    }
});
Object.defineProperties(String.prototype, {
    jshonParse: {
        get: function (value) {
            return JSHON.parse(this+"");
        },
        set: () => {}
    }
});
Object.defineProperties(HTMLElement.prototype, {
    query: {
        get: function () {
            return (value) => this.querySelector(value);
        },
        set: () => {}
    },
    all: {
        get: function () {
            return (value) => this.querySelectorAll(value);
        },
        set: () => {}
    },
    on: {
        get: () => function (...args) {
            let i = 0;
            while(args.length) {
                let type;
                if(typeof args[0] == "string" || Array.isArray(args[0])) {
                    type = Array.isArray(args[0]) ? args.shift() : [args.shift()];
                } else {
                    throw new Error("Event type must be a string. At 'DOM.on' index: " + i);
                }
                let callback;
                if(typeof args[0] == "function") {
                    const fn =  args.shift();
                    callback = evt => fn(evt, this);
                } else {
                    throw new Error("Event callback must be a function. At 'DOM.on' index: " + i);
                }
                let options = typeof args[0] == "object" ? args.shift() : null;
                let useCapture = typeof args[0] == "boolean" ? args.shift() : null;

                
                type.forEach(t => {
                    this.addEventListener(t, callback, options, useCapture);
                });
                i++;
            }
        },
        set: () => {}
    },

    dropdown: {
        get: () => function (...agrs) {
            setupDropdown(this, ...agrs);
        },
        set: () => {}
    },
    modal: {
        get: function () {
            if(this.getAttribute("modal") == null) 
                return null;

            return new Modal(this);
        },
        set: () => {}
    },
    asObject: {
        get: function () {
            if(this.tagName != "FORM") 
                return null;

            return ObjectForm.on(this).get();
        },
        set: () => {}
    },
    objectForm: {
        get: function () {
            if(this.tagName != "FORM") 
                return null;

            return (...args) => ObjectForm.on(this, ...args)
        },
        set: () => {}
    }
    
});
[NodeList.prototype, HTMLCollection.prototype].forEach(collection => {
    Object.defineProperties(collection, {
        forEach: {
            get: function () {
                return (...args) => Array.from(this).forEach(...args);
            },
            set: () => {}
        },
        find: {
            get: function () {
                return (...args) => Array.from(this).find(...args);
            },
            set: () => {}
        },
        filter: {
            get: function () {
                return (...args) => Array.from(this).filter(...args);
            },
            set: () => {}
        },
        reduce: {
            get: function () {
                return (...args) => Array.from(this).reduce(...args);
            },
            set: () => {}
        },
        some: {
            get: function () {
                return (...args) => Array.from(this).some(...args);
            },
            set: () => {}
        },
        every: {
            get: function () {
                return (...args) => Array.from(this).every(...args);
            },
            set: () => {}
        },
        indexOf: {
            get: function () {
                return (...args) => Array.from(this).indexOf(...args);
            },
            set: () => {}
        },
        map: {
            get: function () {
                return (...args) => Array.from(this).map(...args);
            },
            set: () => {}
        },
        on: {
            get: () => function (...args) {
                for (const element of this) {
                    element.on(...args);
                }
            },
            set: () => {}
        },
        query: {
            // TODO CRIAR
        },
        queryMap: {
            get: function () {
                return (...args) => Array.from(this).map(element => element.query(...args));
            },
            set: () => {}
        },
        // todo TESTAR SE ALL EXISTE
        queryAll: {
            get: function () {
                return (...args) => Array.from(this).map(element => element.queryAll(...args));
            },
            set: () => {}
        }
    })
});
const recursiveProxy = (config, defaults) => {
    return new Proxy(config, {
        get(target, key) {
            const value = target[key];
            const defaultValue = defaults?.[key];

            if (value && typeof value === "object") {
                return recursiveProxy(value, defaultValue);
            }

            return value ?? defaultValue;
        }
    });
};
function isClass(value) {
    return typeof value === "function" &&
        /^class\s/.test(Function.prototype.toString.call(value));
}
function syncFetch(url, config = {}) {
    config = recursiveProxy(config, {
        method: "GET",
        headers: {},
        body: undefined
    });
    const xhr = new XMLHttpRequest();

    if(config.body != undefined) {
        config.method = "POST";
        config.headers["Content-Type"] = config.headers["Content-Type"] ?? "application/json";

        config.body = typeof config.body == "object" ? JSON.stringify(config.body) : config.body;
    }

    xhr.open(config.method, url, false); // false = síncrono

    for (const [key, value] of Object.entries(config.headers)) {
        xhr.setRequestHeader(key, value);
    }

    xhr.send(config.body);

    if(xhr.status != 200) {
        logger.warn(`Error fetching "${url}" - ${xhr.status}: ${xhr.statusText}`);
    }

    Object.defineProperties(xhr, {
        error: {
            get: () => xhr.status != 200,
            enumerable: false
        },
        json: {
            get: () => {
                let ret;
                try {
                    ret = JSON.parse(xhr.responseText);
                } catch (e) {
                    logger.warn(`Error parsing JSON - ${e}`);
                    ret = null;
                }
                return ret;
            },
            enumerable: false
        },
        text: {
            get: () => xhr.responseText,
            enumerable: false
        },
        blob: {
            get: () => new Blob(
                [xhr.response],
                { type: xhr.getResponseHeader("Content-Type") }
            ),
            enumerable: false
        }
    });

    return xhr;
}
function observeVector3(vector, onChange) {
    const methods = [
        "set", "setScalar", "setX", "setY", "setZ",
        "setComponent", "add", "addScalar", "addVectors",
        "addScaledVector", "sub", "subScalar", "subVectors",
        "multiply", "multiplyScalar", "multiplyVectors",
        "divide", "divideScalar", "normalize", "setLength",
        "lerp", "lerpVectors", "fromArray"
    ];

    for (const name of methods) {
        const original = vector[name];

        vector[name] = function (...args) {
            const result = original.apply(this, args);
            onChange();
            return result;
        };
    }

    return vector;
}
function isValidFileName(name) {
    if (!name || name.trim() !== name)
        return false;

    if (/[<>:"/\\|?*\x00-\x1F]/.test(name))
        return false;

    if (/[. ]$/.test(name))
        return false;

    if (/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\..*)?$/i.test(name))
        return false;

    return true;
}

/**
 * @function createElement
 * @description Creates an HTML element
 * @returns {HTMLElement}
 * @param {string} tag - (optional) The tag name of the element, defaults to "div"
 * @param {string[]} classList - (optional) The class list of the element
 * @param {object} styles - (optional) The styles of the element
 * @param {object} attributes - (optional) The attributes of the element
 * @param {object} events - (optional) The events of the element
 * @param {object} children - (optional) The children of the element
 * @param {function} callback - (optional) Executed when the element is created, ex: (element) => element.innerHTML = "Hello world"; or function() { this.innerHTML = "Hello world"; }
*/
const createElement = (...args) => {
    const callback = typeof args[args.length - 1] === "function" ? args.pop() : () => {};

    let [
        tag = "div",
        classList = [], 
        styles = {}, 
        attributes = {}, 
        events = {},
        children = [],
    ] = args;

    if(!Array.isArray(classList)) classList = [classList];
    if(!Array.isArray(children)) children = [children];

    const element = document.createElement(tag);

    for (const [key, value] of Object.entries(attributes))
        if (key in element)
            element[key] = value;
        else
            element.setAttribute(key, value);

    for (const [key, value] of Object.entries(styles))
        element.style[key] = value;

    for (const [key, value] of Object.entries(events))
        element.addEventListener(key, value);

    for (const value of classList)
        element.classList.add(value);
    
    callback.call(element, element);
    return element;
}

const setupDropdown = (...args) => {
    if(!args[0]) throw new Error("No element provided");

    let dom = args[0] instanceof HTMLElement ? args[0] : document.querySelector(args[0]);

    const eventType = typeof args[1] === "string" ? args[1] : "click";
    const list = typeof args[1] === "string"? 
        Array.isArray(args[2]) ? args[2] : [args[2]] :
        Array.isArray(args[1]) ? args[1] : [args[1]];

    dom.classList.toggle("hasDropdownMenu", true);
    
    const menu = document.createElement("div");
    menu.classList.add("dropdownMenu", "hidden");

    dom.appendChild(menu);

    const openDropdown = () => {
        menu.classList.toggle("hidden", false);
        const rect = dom.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();

        const gap = 0;

        let x = rect.left;
        let y = rect.bottom + gap;

        if (x + menuRect.width > window.innerWidth)
            x = window.innerWidth - menuRect.width;

        if (x < 0) 
            x = 0;

        if (y + menuRect.height > window.innerHeight)
            y = rect.top - menuRect.height - gap;

        if (y < 0)
            y = rect.bottom + gap;

        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
    }
    const closeDropdown = () => {
        menu.classList.toggle("hidden", true);
    }

    dom.addEventListener(eventType, (evt) => {
        if(eventType === "contextmenu") evt.preventDefault();
        openDropdown();
    });
    dom.addEventListener("mouseleave", closeDropdown);

    if(eventType === "contextmenu")
        window.addEventListener("click", closeDropdown);

    

    list.forEach(item => {
        if(item.parentElement)
            item.parentElement.removeChild(item);
        menu.appendChild(item);

        if(item.closeMenu)
            item.addEventListener("click", closeDropdown);
    });
    
    dom.dropdownOpen = openDropdown;
    dom.dropdownClose = closeDropdown;
}

const formData = (form) => {
    const data = {};

    form.querySelectorAll("input[name]")
    .forEach(input => {
        let value;
        
        if(input.type == "color")
            value = input.value.toUpperCase();
        else if(input.type == "checkbox") {
            if(!input.checked) return;
            else value = input.value;
        } else
            value = input.value;            

        if(form.querySelectorAll(`input[name="${input.name}"]`).length > 1) {
            if(data[input.name] == undefined) data[input.name] = [];

            data[input.name].push(value);            

        } else {
            data[input.name] = value;
        }
    });

    return data;
}


class Modal {
    static instances = [];
    static {
        Modal.prototype.hiddenContainer = createElement("div", e => {
            e.style.display = "none";
            document.body.appendChild(e);
        })
        Modal.prototype.openList = [];

        document.querySelectorAll("[modal]").forEach(modal => {
            const instance = new Modal(modal);
        });
    }
    static on = query => new Modal(query);
    constructor (query) {
        query = query instanceof HTMLElement ? query : document.querySelector(query);
        if(!query) throw new Error("No element found");

        if(Modal.instances.find(instance => instance.element === query))
            return Modal.instances.find(instance => instance.element === query);

        this.element = query;
        this.closeModal = this.element.querySelector("[closemodal]");
        if(this.closeModal)
            this.closeModal.addEventListener("click", () => this.close());
        const {hiddenContainer} = this;

        const isOpen = this.element.getAttribute("modalopen") != null;
        this.isOpen = isOpen;

        const closeOnOut = this.element.getAttribute("nooutclose") == null;

        this.modal = createElement("div", e => {
            e.classList.add("modal");

            e.appendChild(this.element);

            if(closeOnOut)
                e.addEventListener("click", (evt) => {
                    const target = evt.target;

                    if(target == this.modal)
                    this.close()
                });
        });

        this.data = {};

        (isOpen ? document.body : hiddenContainer).appendChild(this.modal);    
        Modal.instances.push(this);    
    }

    onOpen(callback = () => {}) {
        this.onOpenCallback = callback;
    }
    onClose(callback = () => {}) {
        this.onCloseCallback = callback;
    }
    open() {
        if(typeof this.onOpenCallback === "function") this.onOpenCallback(this);
        if(!this.isOpen) {
            document.body.appendChild(this.modal);
            this.isOpen = true;

        } else {
            this.openList.splice(this.openList.indexOf(this), 1);
        }
        
        this.openList.push(this);
        
        this.openList.forEach((instance, index) => {
            instance.modal.style.zIndex = 1000 + index;
        });
    }
    close() {
        if(typeof this.onCloseCallback === "function") this.onCloseCallback(this);
        if(!this.isOpen) return;

        this.hiddenContainer.appendChild(this.modal);
        this.isOpen = false;

        this.openList.splice(this.openList.indexOf(this), 1);
        this.openList.forEach((instance, index) => {
            instance.modal.style.zIndex = 1000 + index;
        });
    }
    toggle(state) {
        (state ?? !this.isOpen) ? this.open() : this.close();
    }
}

class ObjectForm {
    static instances = [];
    static {
        const forms = document.querySelectorAll("form [asobject]");
        forms.forEach(form => {
            new ObjectForm(form);
        })
    }
    static on = (...args) => new ObjectForm(...args);
    constructor (query, callback) {
        const form = query instanceof HTMLElement ? query : document.querySelector(query);
        if(!form) throw new Error("No element found");

        if(ObjectForm.instances.find(instance => instance.element === form)) {
            let instance = ObjectForm.instances.find(instance => instance.element === form);
            if(typeof callback === "function")
                instance.callback = callback;

            return instance;
        }

        this.element = form;
        this.callback = callback;
        
        if(callback != null)
            form.addEventListener("submit", (evt) => {
                this.callback?.(evt, this);
            });

        ObjectForm.instances.push(this);
    }

    get() {
        return formData(this.element);
    }
}

class Interval {
    static instances = [];

    static interval = (...args) => new Interval(...args);
    static timeout = (name, ...args) => {
        return new Interval(name, "timeout", ...args);
    }
    static clear = (name, type) => {
        let intervalExists;
        if(type)
            intervalExists = Interval.instances.filter(ins => ins.name === name && ins.type === type);
        else
            intervalExists = Interval.instances.filter(ins => ins.name === name);

        if(intervalExists.length)
            intervalExists.forEach(ins => ins.clear()); 
    }

    constructor (...args) {
        const name = args[0].typeis.string? args.shift() : null;
        const type = args[0].typeis.string? args.shift() : null;
        let intervalExists = Interval.instances.find(ins => ins.name === name && ins.type === type);
        

        if(name && intervalExists)
            return intervalExists.begin();
        

        if(args[0].typeis.function) 
            this.callback = args.shift();
        else
            throw new Error("No callback provided");

        this.time = typeof args[0] === "number"? args.shift() : 1;
        
        Interval.instances.push(this);

        this.type = type;
        this.name = name;
        this.begin();
    }
    begin() {
        this.clear();
        this.timeout = (this.type == "interval"? setInterval : setTimeout)(this.callback, this.time);
        return this;
    }
    clear() {
        (this.type == "interval"? clearInterval : clearTimeout)(this.timeout);
    }

}
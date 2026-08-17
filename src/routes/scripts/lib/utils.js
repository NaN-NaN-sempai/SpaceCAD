// UTILS
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
})
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

const setupContextMenu = (dom, list) => {
    dom.classList.toggle("hasContextMenu", true);
    
    const menu = document.createElement("div");
    menu.classList.add("contextMenu", "hidden");

    list.forEach(item => {
        if(item.parentElement)
            item.parentElement.removeChild(item);
        menu.appendChild(item);

        if(item.closeMenu) {
            item.addEventListener("click", () => {
                menu.classList.toggle("hidden", true);
            });
        }
    });

    dom.appendChild(menu);

    dom.addEventListener("contextmenu", (evt) => {
        evt.preventDefault();
        menu.classList.toggle("hidden", false);

        const rect = dom.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();

        const gap = 0;

        let x = rect.left;
        let y = rect.bottom + gap;

        // Direita
        if (x + menuRect.width > window.innerWidth) {
            x = window.innerWidth - menuRect.width;
        }

        // Esquerda
        if (x < 0) {
            x = 0;
        }

        // Baixo
        if (y + menuRect.height > window.innerHeight) {
            y = rect.top - menuRect.height - gap;
        }

        // Cima
        if (y < 0) {
            y = rect.bottom + gap;
        }

        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
    });
    dom.addEventListener("mouseleave", () => {
        menu.classList.toggle("hidden", true);
    })

    window.addEventListener("click", () => {
        menu.classList.toggle("hidden", true);
    });
}

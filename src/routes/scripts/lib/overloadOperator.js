/* 
USAGE:

// Overloader makes possible to overload operators in plain javascript
// it depends on acorn.parse and astring.generate

// when creating a class, you can add overloader handlers, ex:

class Vector2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    // overloading the "+" operator
    __overload_sum (that) {
        return new Vector2D(
            this.x + that.x,
            this.y + that.y
        );
    }
}

// now create a Overloader instance with code in which you want to overload operators
// then use ".execute()"

const overloader = new Overloader(() => {
    const v1 = new Vector2D(1, 2);
    const v2 = new Vector2D(4, 5);

    console.log(v1, v2); // -> Vector2D { x: 1, y: 2 } Vector2D { x: 4, y: 5 }
    console.log(v1 + v2); // -> Vector2D { x: 5, y: 7 }
});
overloader.execute();

// this way is useful for running the code multiple times
// the transpiled code is cached in the "generated" property
// then you can use ".execute()" whenever you want

// you can also execute the code directly using the static ".eval" method:
Overloader.eval(() => {
    // your overloaded code...
});

// the function can have a "return" statement if you need to return a value from the overloaded code:
const result = Overloader.eval(() => {
    return v1 + v2;
});
// or
const overloader = new Overloader(() => {
    return v1 + v2;
});
const result = overloader.execute();
console.log(result); // -> Vector2D { x: 5, y: 7 }

// note that the overloaded operators only works in the Overloader callback scope


// SUPPORTED OPERATORS:
// BinaryExpression:
//     arithmetic | ari
//     + : sum : __overload_sum
//     * : mul : __overload_mul
//     - : sub : __overload_sub
//     / : div : __overload_div
//     % : mod : __overload_mod
//     ** : pow : __overload_pow
//     __overload_anyArithmetic : overloads any arithmetic operator and ignores all others arithmetic operators
//
//     equality | equal
//     == : equal : __overload_equal
//     === : strictEqual : __overload_strictEqual
//     != : notEqual : __overload_notEqual
//     !== : strictNotEqual : __overload_strictNotEqual
//     > : greater : __overload_greater
//     < : less : __overload_less
//     >= : greaterEqual : __overload_greaterEqual
//     <= : lessEqual : __overload_lessEqual
//     __overload_anyEquality : overloads any equality operator and ignores all others equality operators
//
// AssignmentExpression:
//     assignment | assignAri
//     += : sumAssign : __overload_sum
//     *= : mulAssign : __overload_mul
//     -= : subAssign : __overload_sub
//     /= : divAssign : __overload_div
//     %= : modAssign : __overload_mod
//     **= : powAssign : __overload_pow
//     __overload_anyAssignArithmetic : overloads any assignment operator and ignores all others assignment operators
//
// UpdateExpression:
//     update || update
//     ++ : increment : __overload_increment
//     -- : decrement : __overload_decrement
//     __overload_anyUpdate : overloads any update operator and ignores all others update operators
//
// UnaryExpression:
//     unary | unary
//     + : plus : __overload_unaryPlus
//     - : minus : __overload_unaryMinus
//     ! : not : __overload_unaryNot
//     ~ : bitNot : __overload_bitNot
//     typeof : __overload_unaryTypeof
//     __overload_anyUnary : overloads any unary operator and ignores all others unary operators
//
// ANY:
//     __overload_any : overloads any operator and ignores all others


// note that the parameter of the UpdateExpression is a boolean, that specifies if the operator is prefix or postfix
// ex: (a class that has a increment operator)
class Food {
    constructor(name, amount = 0) {
        this.name = name;
        this.amount = amount;
    }

    __overload_increment (prefix) {
        if(prefix) { // if the operation is prefix, ex: ++food 
            this.amount++;
            return this;
        }
        else { // if the operation is postfix, ex: food++
            return new Food(this.name, this.amount++);
        }
    }
}

const burger = new Food("Burger");

console.log(burger); // -> Food { name: 'Burger', amount: 0 }
console.log(burger++); // -> Food { name: 'Burger', amount: 0 }
console.log(burger); // -> Food { name: 'Burger', amount: 1 }
console.log(++burger); // -> Food { name: 'Burger', amount: 2 }
console.log(burger); // -> Food { name: 'Burger', amount: 2 }


// unlike the others overloads that uses only 1 parameter,
// the "any" overloads use 2, the other object of the overloading and the callback to execute
// ex: (creating a Vector3D that supports any arithmetic operation)
class Vector3D {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    __overload_anyArithmetic (that, operator) {
        return new Vector3D(
                operator(this.x, that.x),
                operator(this.y, that.y),
                operator(this.z, that.z)
            );
        }
    }
}

const overloader = new Overloader(()=>{
    const v1 = new Vector3D(1, 2, 3);
    const v2 = new Vector3D(4, 5, 6);
    
    console.log(v1 + v2); // -> Vector3D { x: 5, y: 7, z: 9 }
    console.log(v1 * v2); // -> Vector3D { x: 4, y: 10, z: 18 }
});
overloader.execute();

// except for the "__overload_any" that has 3 parameters
__overload_any (that, type, operator) {
    // type can be "ari", "assignAri", "equal", "update", "unary"
}


// checking the type of the other object is useful when you want different types of operations for different types of objects
// ex: (adding to a Vector3D or a primitive number)
__overload_sum (that) {
    if(that instanceof Vector3D) // if the object is a Vector3D
        return new Vector3D(
            this.x + that.x,
            this.y + that.y,
            this.z + that.z
        );

    else if(typeof that === "number") // if the object is a primitive number
        return new Vector3D(
            this.x + that,
            this.y + that,
            this.z + that
        )
}

// ex: (concatenating a Vector3D with primitive string)
__overload_sum (that) {
    if(that instanceof Vector3D) // if the object is a Vector3D
        // same code as above

    else if(typeof that === "number") // if the object is a primitive number
        // same code as above

    else if(typeof that === "string") // if the object is a primitive string
        return `Vector3D { x: ${this.x}, y: ${this.y}, z: ${this.z} } ${that}`;
}
// then
const v1 = new Vector3D(1, 2, 3);
console.log(v1 + "hello"); // -> Vector3D { x: 1, y: 2, z: 3 } hello


// CUSTOM OPERATORS:
// You can add operators manually
// Ex: (adding the "+" operator)
// pass the type (array with the type and operation that is performed on the transform), the operator, the key, and the handler
overloader.add(["BinaryExpression", Overloader.transformHandlers.BinaryExpression], "+", "sum", (a, b) => {
    if(a?.__overload_sum) // if the object has the handler
        return a.__overload_sum(b);

    else // if the object doesn't have the handler or it's a primitive
        return a + b;  
});
// note that to access the handler, you need to use "__overload_" + the key you passed, ex a.__overload_sum
// the type handler is optional if there is already a handler for the type
// ex:
overloader.add("BinaryExpression", ...

// the type handler must be a function that takes 2 parameters, a name that will be used in the callee and the AST node
// ex: (the BinaryExpression handler)
UpdateExpression: (name, node) => ({
    type: "CallExpression",
    callee: {
        type: "Identifier",
        name
    },
    arguments: [node.argument, {
        type: "Literal",
        value: node.prefix
    }]
}),
*/


class Overloader {
    static instances = [];
    static keys = {
        BinaryExpression: {
            // arithmetic
            "+": "sum",
            "*": "mul",
            "-": "sub",
            "/": "div",
            "%": "mod",
            "**": "pow",

            // equality
            "==": "equal",
            "===": "strictEqual",
            "!=": "notEqual",
            "!==": "strictNotEqual",
            ">": "greater",
            "<": "less",
            ">=": "greaterEqual",
            "<=": "lessEqual",
        },

        AssignmentExpression: {
            // assignment
            "+=": "sumAssign",
            "*=": "mulAssign",
            "-=": "subAssign",
            "/=": "divAssign",
            "%=": "modAssign",
            "**=": "powAssign",
        },

        UpdateExpression: {
            // update
            "++": "increment",
            "--": "decrement"
        },

        UnaryExpression: {
            // unary
            "+": "unaryPlus",
            "-": "unaryMinus",
            "!": "unaryNot",
            "~": "unaryBitNot",
            "typeof": "unaryTypeof",
        }
    }
    static handlers = {
        aux: (a, b, type, key) => {
            let handler = Overloader.handlers[key];
            
            if(a?.__overload_any)
                return a.__overload_any(b, type, handler);

            if(type == "ari" && typeof a?.__overload_anyArithmetic == "function")
                return a.__overload_anyArithmetic(b, handler);

            if(type == "assignAri" && typeof a?.__overload_anyAssignArithmetic == "function")
                return a.__overload_anyAssignArithmetic(b, handler);

            if(type == "equal" && typeof a?.__overload_anyEquality == "function")
                return a.__overload_anyEquality(b, handler);

            if(type == "update" && typeof a?.__overload_anyUpdate == "function")
                return a.__overload_anyUpdate(b, handler);

            if(type == "unary" && typeof a?.__overload_anyUnary == "function")
                return a.__overload_anyUnary(b, handler);

            if(typeof a?.[`__overload_${key}`] == "function")
                return a[`__overload_${key}`](b);

            // TESTING IF BREAKS ANYTHING
            /* if(typeof a?.[key] == "function")
                return a[key](b); */

            return null;
        },
        

        // Arithmetic
        sum: (a, b) => {
            const ovl = Overloader.handlers.aux(a, b, "ari", "sum");

            if(ovl != null) return ovl;
            return a + b;
        },
        sub: (a, b) => {
            const ovl = Overloader.handlers.aux(a, b, "ari", "sub");

            if(ovl != null) return ovl;
            return a - b;
        },
        mul: (a, b) => {
            const ovl = Overloader.handlers.aux(a, b, "ari", "mul");

            if(ovl != null) return ovl;
            return a * b;
        },
        div: (a, b) => {
            const ovl = Overloader.handlers.aux(a, b, "ari", "div");

            if(ovl != null) return ovl;
            return a / b;
        },
        mod: (a, b) => {
            const ovl = Overloader.handlers.aux(a, b, "ari", "mod");

            if(ovl != null) return ovl;
            return a % b;
        },
        pow: (a, b) => {
            const ovl = Overloader.handlers.aux(a, b, "ari", "pow");

            if(ovl != null) return ovl;
            return a ** b;
        },

        // Assignment
        sumAssign: (a, b, type, key) => {
            const ovlObj = type == "property" ? a[key]:a;
            const ovl = Overloader.handlers.aux(ovlObj, b, "assignAri", "sumAssign");
            
            if(ovl != null) return ovl;
            if(type == "property") return a[key] += b;
            if(type == "identifier") return a + b;

            return a += b;
        },
        subAssign: (a, b, type, key) => {
            const ovlObj = type == "property" ? a[key]:a;
            const ovl = Overloader.handlers.aux(ovlObj, b, "assignAri", "subAssign");

            if(ovl != null) return ovl;
            if(type == "property") return a[key] -= b;
            if(type == "identifier") return a - b;
            return a -= b;
        },
        mulAssign: (a, b, type, key) => {
            const ovlObj = type == "property" ? a[key]:a;
            const ovl = Overloader.handlers.aux(ovlObj, b, "assignAri", "mulAssign");

            if(ovl != null) return ovl;
            if(type == "property") return a[key] *= b;
            if(type == "identifier") return a * b;
            return a *= b;
        },
        divAssign: (a, b, type, key) => {
            if(type == "property") a = a[key];
            const ovlObj = type == "property" ? a[key]:a;
            const ovl = Overloader.handlers.aux(ovlObj, b, "assignAri", "divAssign");

            if(ovl != null) return ovl;
            if(type == "property") return a[key] /= b;
            if(type == "identifier") return a / b;
            return a /= b;
        },
        modAssign: (a, b, type, key) => {
            const ovlObj = type == "property" ? a[key]:a;
            const ovl = Overloader.handlers.aux(ovlObj, b, "assignAri", "modAssign");

            if(ovl != null) return ovl;
            if(type == "property") return a[key] %= b;
            if(type == "identifier") return a % b;
            return a %= b;
        },
        powAssign: (a, b, type, key) => {
            const ovlObj = type == "property" ? a[key]:a;
            const ovl = Overloader.handlers.aux(ovlObj, b, "assignAri", "powAssign");

            if(ovl != null) return ovl;
            if(type == "property") return a[key] **= b;
            if(type == "identifier") return a ** b;
            return a **= b;
        },

        // Equality
        equal: (a, b) => {
            const ovl = Overloader.handlers.aux(a, b, "equal", "equal");

            if(ovl != null) return ovl;
            return a == b;
        },
        notEqual: (a, b) => {
            const ovl = Overloader.handlers.aux(a, b, "equal", "notEqual");

            if(ovl != null) return ovl;
            return a != b;
        },
        strictEqual: (a, b) => {
            const ovl = Overloader.handlers.aux(a, b, "equal", "strictEqual");

            if(ovl != null) return ovl;
            return a === b;
        },
        strictNotEqual: (a, b) => {
            const ovl = Overloader.handlers.aux(a, b, "equal", "notStrictEqual");

            if(ovl != null) return ovl;
            return a !== b;
        },
        greater: (a, b) => {
            const ovl = Overloader.handlers.aux(a, b, "equal", "greater");

            if(ovl != null) return ovl;
            return a > b;
        },
        less: (a, b) => {
            const ovl = Overloader.handlers.aux(a, b, "equal", "less");

            if(ovl != null) return ovl;
            return a < b;
        },
        greaterEqual: (a, b) => {
            const ovl = Overloader.handlers.aux(a, b, "equal", "greaterEqual");

            if(ovl != null) return ovl;
            return a >= b;
        },
        lessEqual: (a, b) => {
            const ovl = Overloader.handlers.aux(a, b, "equal", "lessEqual");

            if(ovl != null) return ovl;
            return a <= b;
        },

        // Update
        increment: (a, prefix) => {
            const ovl = Overloader.handlers.aux(a, prefix, "update", "increment");

            if(ovl != null) return ovl;
            return prefix ? ++a : a++;
        },
        decrement: (a, prefix) => {
            const ovl = Overloader.handlers.aux(a, prefix, "update", "decrement");

            if(ovl != null) return ovl;
            return prefix ? --a : a--;
        },

        // Unary
        unaryPlus: a => {
            const ovl = Overloader.handlers.aux(a, null, "unary", "unaryPlus");

            if(ovl != null) return ovl;
            return +a;
        },
        unaryMinus: a => {
            const ovl = Overloader.handlers.aux(a, null, "unary", "unaryMinus");

            if(ovl != null) return ovl;
            return -a;
        },
        unaryNot: a => {
            const ovl = Overloader.handlers.aux(a, null, "unary", "unaryNot");

            if(ovl != null) return ovl;
            return !a;
        },
        unaryBitNot: a => {
            const ovl = Overloader.handlers.aux(a, null, "unary", "unaryBitNot");

            if(ovl != null) return ovl;
            return ~a;            
        },
        unaryTypeof: a => {
            const ovl = Overloader.handlers.aux(a, null, "unary", "unaryTypeof");

            if(ovl != null) return ovl;
            return typeof a;
        }
    }
    static transformHandlers = {
        UpdateExpression: (name, node) => ({
            type: "CallExpression",
            callee: {
                type: "Identifier",
                name
            },
            arguments: [node.argument, {
                type: "Literal",
                value: node.prefix
            }]
        }),
        BinaryExpression: (name, node) => ({
            type: "CallExpression",
            callee: {
                type: "Identifier",
                name
            },
            arguments: [node.left, node.right]
        }),
        AssignmentExpression: (name, node) => {
            if(node.left.type == "MemberExpression") {
                return {
                    type: "CallExpression",
                    callee: { type: "Identifier", name },
                    arguments: [
                        node.left.object, 
                        node.right,
                        { type: "Literal", value: "property" },
                        node.left.computed
                            ? node.left.property
                            : { type: "Literal", value: node.left.property.name },
                    ]
                }   
            } else if(node.left.type == "Identifier") {
                return  {
                    type: "AssignmentExpression",
                    operator: "=",
                    left: node.left,
                    right: {
                        type: "CallExpression",
                        callee: { type: "Identifier", name },
                        arguments: [node.left, node.right, { type: "Literal", value: "identifier" }]
                    }
                };
            } else 
                return Overloader.transformHandlers.BinaryExpression(name, node);
        },

        UnaryExpression: (name, node) => ({
            type: "CallExpression",
            callee: {
                type: "Identifier",
                name
            },
            arguments: [node.argument]
        }),
    }

    static eval = (fn, onError) => new Overloader(fn).onError(onError).execute();
    static evalArgs = (fn, onError) => new Overloader(fn).onError(onError).execute;

    constructor(callback) {
        const transform = (node, parent, key) => {
            if(!node || typeof node !== "object") return;


            for(let k in node) {
                transform(node[k], node, k);
            }

            if(node.type in Overloader.keys) {

                if(!(node.operator in Overloader.keys[node.type])) return;

                const name =  `Overloader.handlers.${Overloader.keys[node.type][node.operator]}`;
                const transformHandler = Overloader.transformHandlers[node.type];

                parent[key] = transformHandler(name, node);

                return;
            }
            
        }

        this.code = callback.toString();

        this.ast = acorn.parse(this.code, {
            ecmaVersion: "latest"
        });

        transform(this.ast, null, null);

        this.generated = window.astring.generate(this.ast);

        Overloader.instances.push(this);
    }

    /**
     * @param {string} type - type of operator, ex: "BinaryExpression", "AssignmentExpression"...
     * @param {string} operator - operator, ex: "+", "*", "-", ...
     * @param {string} key - the key to be used in the handler, ex: the key of "+" is "sum"
     * @param {function} handler - the handler to be executed
    */
    add (type, operator, key, handler) {
        if(type[0] == undefined) throw new Error("You must provide a key and a handler for the type. The handler is optional when there is already a handler for the type.");
        if(typeof type == "string") type = [type];

        if(Overloader.keys[type[0]][operator] != undefined) console.warn(`Overloader ${type[0]} ${operator} already exists, the handler will be overwritten.`);
        
        Overloader.keys[type[0]][operator] = key;
        Overloader.handlers[key] = handler;

        this.addTransformHandler(...type);
    }

    addTransformHandler(type, handler) {
        if(handler == undefined && Overloader.transformHandlers[type] != undefined) throw new Error("You must provide a handler for the type if there is none.");
        if(handler == undefined) return;
        if(Overloader.transformHandlers[type] != undefined) console.warn(`Overloader transform handler ${type[0]} already exists, the handler will be overwritten.`);
        Overloader.transformHandlers[type] = handler;
    }

    onError(callback) {
        if(typeof callback != "function") return this;
        this.__errorCallback = callback;
        return this;

    }
    execute = (...args) => {
        let execute;
        try {
            execute = new Function(`
                return ${this.generated}
            `)()(...args);
        } catch(e) {
            if(this.__errorCallback) this.__errorCallback(e);
        }
        
        return execute;
    }
    
}
const generateSpaceCAD = Overloader.evalArgs((scene, console = window?.console) => {

const camera = scene.camera;
    
const SpaceCAD = class SpaceCAD {
    static store = function (preload = false) {
        let cls = isClass(this)? this : this.constructor;

        if([SpaceCAD, SpaceCAD.Root, SpaceCAD.Mesh, SpaceCAD.Group, SpaceCAD.RootObject, SpaceCAD.Object].includes(cls))
            return console.warn(`Cannot store ${cls.name}. It is a reserved class.`);

        // saving object
        if(!isClass(this)) {
            const json = JSON.stringify(this.toJSON());
            
        }

        const dependencies = cls.dependencies || [];
        const classBody = cls.toString();
        const usage = cls.usage;

        syncFetch("/store/class", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: cls.name,
                dependencies,
                classBody,
                usage,
                preload
            })
        })
        

        return this;
    }
    static storeLib = function (name, lib, preload = false) {
        if(lib == undefined)
            lib = {lib: null, usage: null};

        if(typeof name != "string" || name.length == 0)
            return console.warn(`malformed name`);

        const bodyObj = {
            name,
            lib: JSHON.stringify(lib),
            usage: lib.usage,
            preload
        };
        const body = JSON.stringify(bodyObj);

        syncFetch("/store/lib", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body
        })

    }
    static module = new Proxy(
        function(name) {
            const req = syncFetch(`/store/class/${name}`);

            if (req.error) return;

            const {
                dependencies,
                classBody
            } = req.json;

            const constructor = new Function(
                `return (${classBody})`
            )();
            const operator = (...args) => new constructor(...args);

            return {
                dependencies: dependencies.map(name => SpaceCAD.access(name)),
                constructor,
                operator
            };
            
        },
        {
            get(target, name) {
                return target(name);
            },
            set() {}
        }
    );
    static get modules() {
        const req = syncFetch("/store/classes/_");

        return req.json;
    }
    static lib = new Proxy(
        function(name, asGlobal = false) {
            const req = syncFetch(`/store/lib/${name}`);

            if (req.error) return;

            let {
                lib,
                usage
            } = req.json;

            lib = JSHON.parse(lib);

            if(asGlobal && typeof lib != "object") {
                console.warn(`(${name}) is not a globalizable library.`);
                return lib;
            }

            if(asGlobal) {
                for (const [key, value] of Object.entries(lib)) {
                    if([
                        "SpaceCAD",
                        "syncFetch",
                        "isClass",
                        "recursiveProxy",
                        "getDirection",
                        "isAboveMouse",
                        "isAboveMouseGroup",
                        "THREE",

                        "Arrow",
                        "scene",
                        "UIScene",
                        "PivotCamera",
                        "camera",
                        "UICamera",
                        "renderer",
                        "canvas",
                        "pmremGenerator",
                        "environmentMap",
                        "auxCanvas",
                        "light",
                        "raycaster",
                        "cameraMoveToMouse",
                        "uiOverlayMaterial",
                        "UI",
                        "UIDistance",
                        "Gizmo",
                        "DirectionGizmo",
                        "Metalom",
                        "metalom",
                        "MouseLock",
                        "mouseLock",
                        "lockMouse",
                        "unlockMouse",
                        "setCursor",
                        "cursor",
                        "mousePosition",
                        "JSHON",
                        "Overloader"
                    ].includes(key)) {
                        console.warn(`value (${key}) is reserved.`);
                        continue;
                    }

                    if(window[key] != undefined) {
                        console.warn(`property (${key}) of window will be overwritten. While loading (${name}).`);

                        SpaceCAD.windowProperties[key] = window[key];
                    }

                    SpaceCAD.libKeys.push(key);
                    window[key] = value;
                }
                return lib;
            }

            return lib;

        },
        {
            get(target, name) {
                if(name === "asGlobal")
                    return new Proxy(
                        {},
                        {
                            get(_, name) {
                                return target(name, true);
                            },
                            set(_, name, value) {
                                SpaceCAD.storeLib(name, value);
                            }
                        }
                    )

                return target(name);
            },
            set(target, name, value) {
                SpaceCAD.storeLib(name, value);
            }
        }
    );
    static get libs() {
        const req = syncFetch("/store/libs/_");

        return req.json;
    }
    static setPreloads = () => {
        Object.entries(SpaceCAD.libs).forEach(([key, value]) => {
            if(!value.preload) return;

            try {
                window[key] = value.lib.jshonParse;
            } catch (error) {
                console.error(error);
            }
        });
        Object.entries(SpaceCAD.modules).forEach(([key, value]) => {
            if(!value.preload) return;

            try {
                const cls = new Function("return " + value.classBody)();
                const constructor = (...args) => new cls(...args);
    
                window[key] = cls;
                window["_"+key] = constructor;
            } catch (error) {
                console.error(error);
            }
        });
    }

    
    static readFile = (path, type = "relative") => {
        if(typeof path !== "string")
            throw new Error("Path must be a string.");

        const req = syncFetch(`/getFile/${type}`, {
            method: "POST",
            body: JSON.stringify({path})
        });

        if(req.error)
            return null;
        
        return req;
    }

    static useInstances = [];
    static useEnable = false;
    static use = (path) => {
        SpaceCAD.useEnable = true;
        SpaceCAD.useInstances = [];

        if(typeof path !== "string")
            throw new Error("Path must be a string.");

        const req = syncFetch(`/use`, {
            method: "POST",
            body: JSON.stringify({path})
        });

        if(req.error)
            return null;
        
        const code = req.text;        
        
        let returnValue = SpaceCAD.run(code, false);
        SpaceCAD.useEnable = false;
        
        const __constructorList = [];
        const __constructors = {};
        const __classes = {};
        SpaceCAD.useInstances.forEach(instance => {
            if(__constructorList.includes(instance.constructor)) return;

            __constructors[instance.constructor.name] = (...args) => new instance.constructor(...args);
            __classes[instance.constructor.name] = instance.constructor;
            __constructorList.push(instance.constructor);
        });

        const preObj = typeof returnValue === "object"? returnValue : {
            default: returnValue
        };
        const obj = {
            ...preObj
        };

        Object.defineProperties(obj, {
            __instances: {
                value: SpaceCAD.useInstances,
                enumerable: false
            },
            __constructorList: {
                value: __constructorList,
                enumerable: false
            },
            __constructors: {
                value: __constructors,
                enumerable: false
            },
            __classes: {
                value: __classes,
                enumerable: false
            }
        });
        

        return obj;
    }


    static windowProperties = {};
    static libKeys = [];
    static deleteAll = () => {
        while(SpaceCAD.instances.length > 0) {
            SpaceCAD.instances.forEach(instance => instance.delete());
        }
    }
    static restoreDefaultState = () => {
        SpaceCAD.libKeys.forEach(key => {
            delete window[key];
        });
        SpaceCAD.libKeys = [];
        Object.entries(SpaceCAD.windowProperties).forEach(([key, value]) => {
            window[key] = value;
        });
        SpaceCAD.windowProperties = {};
        console.clear();
    }
    static run = (code, restore = true) => {
        const regex = /\bexpose\b/g;
        if (regex.test(code)) {
            code = `
                let __ExposeObject = {};
                ${code.replace(regex, "__ExposeObject")}
                return __ExposeObject;
            `;
        }

        if(restore) {
            SpaceCAD.deleteAll();
            SpaceCAD.restoreDefaultState();
        }
        const fn = new Function(code);
        
        return Overloader.eval(fn, error => console.error(error));
    }

    static currentSpace = null;

    static instances = [];
    static roots = [];

    static instancesUpdate = () => {
        SpaceCAD.instances.forEach(instance => instance.update?.());
    }

    // implement
    static DOMList = () => {
        const arr = [];
        const ns = (obj, list) => {
            const name = obj.name;

            if(!list) {
                arr.push(`root: ${name}`);
            } else if(list.indexOf(obj) == 0 && list.length == 1) {
                arr.push(`singular start and end: ${name}`);
            } else if(list.indexOf(obj) == 0) {
                arr.push(`start: ${name}`);
            } else if(list.indexOf(obj) == list.length - 1) {
                arr.push(`end: ${name}`);
            } else {
                arr.push(`between: ${name}`);
            }


            if(obj.children.length)
                obj.children.forEach(child => ns(child, obj.children));


            return arr;
        }

        SpaceCAD.roots.forEach(root => ns(root));

        return arr;
    }
    

    static Root = CLASS => class extends CLASS {
        constructor(...args) {
            // setting static
            CLASS.store = SpaceCAD.store;

            super(...args);

            this.isSpaceCAD = true;
            this.name = this._name = CLASS.name;

            const calculateBoxSize = (object) => {
                const box = new THREE.Box3().setFromObject(object);

                const size = new THREE.Vector3();
                box.getSize(size);

                return size;
            };

            this.__ogBoxSize = calculateBoxSize(this);
            this.opacity = this.__opacity = 1;

            Object.defineProperties(this, {
                name: {
                    get: () => this._name,
                    set: (name) => {
                        if(typeof name !== "string")
                            return this._name;
                        else 
                            return this._name = name;
                    }
                },
                boxSize: {
                    get: () => {
                        return this.__ogBoxSize.clone().multiply(this.scale);
                    },
                    set: () => {}
                },
                computedBoxSize: {
                    get: () => {
                        return calculateBoxSize(this);
                    },
                    set: () => {}
                },

                opacity: {
                    get: () => this.__opacity,
                    set: (value) => {
                        this.__opacity = value;

                        if(this.material) {
                            this.material.opacity = value;

                            if(value == 1)
                                this.material.transparent = false;
                            else 
                                this.material.transparent = true;
                        }

                        this.children.forEach(child => {
                            child.opacity = value;
                        });
                    }
                }
                
            });

            SpaceCAD.instances.push(this);
            
            if(SpaceCAD.currentSpace)
                SpaceCAD.currentSpace.add(this);
            else {
                if(SpaceCAD.useEnable)
                    SpaceCAD.useInstances.push(this);
                else {
                    SpaceCAD.roots.push(this);
                    scene.add(this);
                }
            }
        }

        delete() {
            [...this.children].forEach(child => {
                if (typeof child.delete === "function")
                    child.delete();
                else
                    child.removeFromParent();
            });

            const index = SpaceCAD.instances.indexOf(this);
            SpaceCAD.instances.splice(index, 1);

            const rootIndex = SpaceCAD.roots.indexOf(this);
            if (rootIndex !== -1)
                SpaceCAD.roots.splice(rootIndex, 1);

            this.removeFromParent();

            if (this.geometry)
                this.geometry.dispose();

            if (this.material) {
                if (Array.isArray(this.material))
                    this.material.forEach(mat => mat.dispose());
                else
                    this.material.dispose();
            }
        }
        
        store = SpaceCAD.store;

        space (callback) {
            if(typeof callback !== "function") return this;

            const previousSpace = SpaceCAD.currentSpace;

            SpaceCAD.currentSpace = this;
             
            try {
                callback.call(this);
            } finally {
                SpaceCAD.currentSpace = previousSpace;
            }

            return this;
        }

        setPosition (x, y, z) {
            this.position.set(x, y, z);
            return this;
        }
        setPos = this.setPosition;
        setRotation (...args) {
            this.rotation.set(...args.map(x => x * (Math.PI / 180)));
            return this;
        }
        setRot = this.setRotation;
        setRotationPI (x, y, z) {
            this.rotation.set(x, y, z);
            return this;
        }
        setRotPI = this.setRotationPI;
        setScale (x, y, z) {
            this.scale.set(x, y, z);
            return this;
        }
        setScl = this.setScale;
        mirror (x, y, z) {
            this.scale.set(
                x ? -1 : 1,
                y ? -1 : 1,
                z ? -1 : 1
            );
            return this;
        }
    }
    static Mesh = class extends SpaceCAD.Root(THREE.Mesh) {
        static instances = [];
        constructor(geometry, material) {
            super(geometry, material);

            this.ignoreEdgeHilighting = false;
            this.edgeHilighting = SpaceCAD.edgeHilighting;
            this.toggleEdgeHilighting(this.edgeHilighting);

            SpaceCAD.Mesh.instances.push(this);
        }

        toggleEdgeHilighting (togle) {
            if(this.ignoreEdgeHilighting) return;

            if(togle) {
                const edges = new THREE.EdgesGeometry(this.geometry);

                const line = new THREE.LineSegments(
                    edges,
                    new THREE.LineBasicMaterial({ color: "#ffffff" })
                );

                line.name = `__edges`;

                this.add(line);

            } else {
                const edges = this.children.find(child => child.name == "__edges");
                edges?.removeFromParent?.();
            }
        }
        
    }
    static mesh = (...args) => new SpaceCAD.Mesh(...args);
    static Group = class extends SpaceCAD.Root(THREE.Group) {
        static instances = [];
        constructor() {
            super();

            SpaceCAD.Group.instances.push(this);
        }
    }
    static group = (...args) => new SpaceCAD.Group(...args);


    static RootObject = CLASS => class extends CLASS {
        static store = SpaceCAD.store;
        constructor(prop = {}, ...args) {
            super(...args);

            this.constructorProps = prop;

            const position = prop.pos || prop.position;
            if(position && (Array.isArray(position) || position instanceof THREE.Vector3) )
                if(Array.isArray(position)) this.position.set(...position);
                else this.position.copy(position);
            
            const rotation = prop.rot || prop.rotation;
            if(rotation && (Array.isArray(rotation) || rotation instanceof THREE.Vector3) )
                if(Array.isArray(rotation)) this.rotation.set(...rotation);
                else this.rotation.copy(rotation);

            const scale = prop.scl || prop.scale;
            if(scale && (Array.isArray(scale) || scale instanceof THREE.Vector3) )
                if(Array.isArray(scale)) this.scale.set(...scale);
                else this.scale.copy(scale);

        }
    }

    static Object = class extends SpaceCAD.RootObject(SpaceCAD.Mesh) {};
    static GroupObject = class extends SpaceCAD.RootObject(SpaceCAD.Group) {};


    static SvgToObject = class extends SpaceCAD.GroupObject {
        constructor(prop = {}) {
            prop = recursiveProxy(prop, {
                svg: "",
                depth: 0,
                material: THREE.MeshStandardMaterial,
                materialProps: {
                    color: 0xffffff, 
                    side: THREE.DoubleSide
                },
                holes: false
            })
            if(!prop.svg)
                throw new Error("svg is required");

            const text = prop.svg;

            const loader = new THREE.SVGLoader();
            const svgObj = loader.parse(text);

            super(prop);

            this.depth = this.__depth = prop.depth;
            this.material = this.__material = new prop.material(prop.materialProps);

            const generateShape = () => {
                svgObj.paths.forEach(path => {
                    const shapes = path.toShapes(prop.holes);

                    shapes.forEach(shape => {
                        const geometry = 
                        this.depth == 0? 
                        new THREE.ShapeGeometry(shape) :
                        new THREE.ExtrudeGeometry(shape, {
                            depth: this.depth,
                            bevelEnabled: false
                        });

                        const material = this.material;

                        this.space(() => {
                            const mesh = new SpaceCAD.Mesh(geometry, material);
                        })
                    });
                });
            }

            Object.defineProperties(this, {
                depth: {
                    set: (value) => {
                        if(!Number.isInteger(value))
                            return console.warn("depth must be an integer");

                        this.children.forEach(child => child.erase());
                        this.__depth = value;
                        generateShape();
                    },
                    get: () => this.__depth
                },
                material: {
                    set: (value) => {
                        if(!value instanceof THREE.Material)
                            return console.warn("material must be an instance of THREE.Material");

                        this.children.forEach(child => child.material = value);
                        this.__material = value;
                    },
                    get: () => this.__material
                }
            });

            generateShape();

        }
        
    }
    static SvgToObjectFromFile = class extends SpaceCAD.SvgToObject {
        constructor(prop = {}) {
            prop = recursiveProxy(prop, {
                path: "",
            });

            if(!prop.path)
                throw new Error("path is required");

            prop.svg = SpaceCAD.readFile(prop.path).text;

            super(prop);

            
        }
    }

    static LineBase = class extends SpaceCAD.Root(THREE.Line2) {
        constructor(from=new THREE.Vector3(0, 0, 0), to=new THREE.Vector3(0, 0, 0), prop = {}) {
            prop = recursiveProxy(prop, {
                color: 0x000000,
                opacity: 1,
                width: 1,
                type: "direct",
                control: new THREE.Vector3(0, 0, 0)
            });

            const {
                color,
                opacity,
                width,
                type,
                control
            } = prop;

            from = Array.isArray(from)? new THREE.Vector3(...from) : from;
            to = Array.isArray(to)? new THREE.Vector3(...to) : to;

            
            const setGeometry = (from, to, control, afterCreation = false) => {
                let geometry;
                if(type === "direct") {
                    geometry = new THREE.LineGeometry();

                    geometry.setPositions([
                        from.x, from.y, from.z,
                        to.x, to.y, to.z
                    ]);
                } else if(type === "bezier") {
                    const curve =new THREE.QuadraticBezierCurve3(
                        from,
                        control,
                        to
                    );
                    const points = curve.getPoints(50);

                    const position = [];
                    
                    for(const point of points)
                        position.push(point.x, point.y, point.z);

                    geometry = new THREE.LineGeometry();
                    geometry.setPositions(position);
                }

                if(afterCreation && typeof this.reloadGeometryCallback === "function")
                    this.reloadGeometryCallback(from, to, control);

                return geometry;
            }

            const geometry = setGeometry(from, to, control);


            const material = new THREE.LineMaterial({
                color,
                linewidth: width,
                opacity,
                transparent: true
            });

            super(geometry, material);

            this.prop = prop;

            this.from = this.__from = from;
            this.to = this.__to = to;
            this.control = this.__control = control;

            Object.defineProperties(this, {
                from: {
                    set: (value) => {
                        this.__from = value;
                        
                        this.geometry = setGeometry(value, this.__to, this.__control, true);
                    },
                    get: () => this.__from
                },
                to: {
                    set: (value) => {
                        this.__to = value;

                        this.geometry = setGeometry(this.__from, value, this.__control, true);
                    },
                    get: () => this.__to
                },
                control: {
                    set: (value) => {
                        if(this.type == "bezier") return console.warn("Line type is not bezier");
                        this.__control = value;

                        this.geometry = setGeometry(this.__from, this.__to, value, true);
                    },
                    get: () => this.__control
                }
                
            })

            if(type === "bezier") 
                this.computeLineDistances();
        }
    }
    static ArrowBase = class extends SpaceCAD.LineBase {
        constructor(...args) {
            super(...args);

            const generateHead = (from, to, control, propAngle = 45, headSize = 30) => {
                const direction = new THREE.Vector3();
    
                if (this.prop.type === "bezier") {
                    direction.subVectors(to, control);
                } else {
                    direction.subVectors(to, from);
                }
                direction.normalize();

                const angle = THREE.MathUtils.degToRad(propAngle ?? 45);
                const left = direction.clone()
                    .applyAxisAngle(new THREE.Vector3(0, 0, 1), angle);
    
                const right = direction.clone()
                    .applyAxisAngle(new THREE.Vector3(0, 0, 1), -angle);
    
                const size = headSize ?? 30;
    
                const leftTo = to.clone().addScaledVector(left, -size);
                const rightTo = to.clone().addScaledVector(right, -size);
                const headProp = {
                    color: this.prop.color,
                    width: this.prop.width,
                    type: "direct",
                    opacity: this.prop.opacity,
                    transparent: true,
                }

                return {
                    from, to,
                    leftTo, rightTo,
                    headProp
                }
            };
            const generateHeads = () => {
                let {prop} = this;
                prop = recursiveProxy(prop, {
                    startHeadSize: 30, endHeadSize: 30,
                    startHeadAngle: 45, endHeadAngle: 45,
                    startHead: false, endHead: true,
                    angle: null, headSize: null,
                });
                if(prop.angle) prop.startHeadAngle = prop.endHeadAngle = prop.angle;
                if(prop.headSize) prop.startHeadSize = prop.endHeadSize = prop.headSize;

                const {startHead, endHead, startHeadSize, endHeadSize, startHeadAngle, endHeadAngle} = prop;

                if(endHead) {
                    const {to, leftTo, rightTo, headProp} = generateHead(this.from, this.to, this.control, endHeadAngle, endHeadSize);

                    if(this.endHeadLeft) this.endHeadLeft.erase();
                    if(this.endHeadRight) this.endHeadRight.erase();
                    this.endHeadLeft = new SpaceCAD.LineBase(to, leftTo, headProp);
                    this.endHeadRight = new SpaceCAD.LineBase(to, rightTo, headProp);

                    this.add(this.endHeadLeft, this.endHeadRight);
                }

                if(startHead) {
                    const {to, leftTo, rightTo, headProp} = generateHead(this.to, this.from, this.control, startHeadAngle, startHeadSize);

                    if(this.startHeadLeft) this.startHeadLeft.erase();
                    if(this.startHeadRight) this.startHeadRight.erase();
                    this.startHeadLeft = new SpaceCAD.LineBase(to, leftTo, headProp);
                    this.startHeadRight = new SpaceCAD.LineBase(to, rightTo, headProp);

                    this.add(this.startHeadLeft, this.startHeadRight);
                }
            }

            this.reloadGeometryCallback = generateHeads;
            
            generateHeads();            
        }
    }
    static Arrow = class extends SpaceCAD.GroupObject {
        constructor(...args) {
            const propIsObject = args.at(-1) instanceof Object && !(args.at(-1) instanceof THREE.Vector3);
            let prop = propIsObject? args.pop(): {};
            prop = recursiveProxy(prop, {
                color: 0x000000,
                width: 1,
                type: "direct",
                controls: [],
                startHead: false,
                endHead: true
            });

            super();

            this.space(() => {
                args.forEach((arg, i) => {
                    if(args[i + 1] === undefined) return;

                    const lineProp = {
                        ...prop,
                        control: prop.controls[i] || new THREE.Vector3(0, 0, 0)
                    };

                    if(i === args.length - 2 || i === 0)
                        new SpaceCAD.ArrowBase(arg, args[i + 1], {
                            ...lineProp,
                            startHead: i === 0 && prop.startHead,
                            endHead: i === args.length - 2 && prop.endHead
                        });
                    else 
                        new SpaceCAD.LineBase(arg, args[i + 1], lineProp);
                })
            })
        }
    }
    static Line = class extends SpaceCAD.GroupObject {
        constructor(...args) {
            const propIsObject = args.at(-1) instanceof Object && !(args.at(-1) instanceof THREE.Vector3);
            let prop = propIsObject? args.pop(): {};
            prop = recursiveProxy(prop, {
                color: 0x000000,
                width: 1,
                type: "direct",
                controls: []
            });

            super();

            this.space(() => {
                
                args.forEach((arg, i) => {
                    if(args[i + 1] === undefined) return;

                    const lineProp = {
                        ...prop,
                        control: prop.controls[i] || new THREE.Vector3(0, 0, 0)
                    }
                    new SpaceCAD.LineBase(arg, args[i + 1], lineProp);
                })
            })
        }
    }
    
    static Ruler = class extends SpaceCAD.Arrow {
        constructor(from = v0, to = v0, prop = {}) {
            prop = recursiveProxy(prop, {
                startHead: true,
                endHead: true,
                angle: 90,
                width: 2,
                toFixed: 0,
                color: cssVar.primary,
                
                fontSize: 48,
                font: `Arial`,
                align: "center",
                textColor: "white",
                background: cssVar.primary,
                borderRadius: 2,
                border: [3, cssVar.tertiary],
                padding: 5,
                resolution: 1,

                awaysLooking: true,

                postfix: "mm",
            });

            super(from, to, prop);

            this.arrow = this.children[0];

            this.from = this.__from = from;
            this.to = this.__to = to;
            
            const setOnchange = () => {
                this.distance = (this.to - this.from).length();
                const minSize = 200;
                const fontSize = this.distance <= 200 ? prop.fontSize * (this.distance / 200) : prop.fontSize;

                if(!this.text) {
                    this.space(() => {
                        this.text = new SpaceCAD.Text({
                            resolution: prop.resolution,
                        })
                    });
                }
                
                this.text.fontSize = fontSize;
                this.text.position.copy(((this.from + this.to) / 2) + (vy * 40));
                this.text.font = prop.font;
                this.text.align = prop.align;
                this.text.color = prop.textColor;
                this.text.background = prop.background;
                this.text.borderRadius = prop.borderRadius;
                this.text.border = prop.border;
                this.text.padding = prop.padding;
                this.text.text = this.distance.toFixed(prop.toFixed) + (prop.postfix? " " + prop.postfix: "");
                this.text.awaysLooking = prop.awaysLooking;
                this.text.resolution = prop.resolution;

                this.arrow.from = this.from;
                this.arrow.to = this.to;    
                this.arrow.width = prop.width;            
            }

            setOnchange();

            Object.defineProperties(this, {
                from: {
                    get: () => this.__from,
                    set: (value) => {
                        this.__from = value;
                        setOnchange();
                    }
                },
                to: {
                    get: () => this.__to,
                    set: (value) => {
                        this.__to = value;
                        setOnchange();
                    }
                }
            })

            console.log(this.distance)
        }
    }


    // others
    static AxesHelper = class extends THREE.LineSegments {
        constructor(pivotCamera ,  color = 0x000000, size = 100000, opacity = .2) {
            const vertices = [
                -size, 0, 0,	size, 0, 0,
                0, -size, 0,	0, size, 0,
                0, 0, -size,	0, 0, size
            ];

            const colors = [
                1, 0, 0,	1, 0.6, 0,
                0, 1, 0,	0.6, 1, 0,
                0, 0, 1,	0, 0.6, 1
            ];


            



            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
            geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

            const material = new THREE.LineBasicMaterial( {
                vertexColors: true, 
                toneMapped: false,
                transparent: true,
                opacity
            } );

            super( geometry, material );

            this.camera = camera;
            this.ogVertices = vertices;

            this.size = size;

            this.setColors( color );

            this.type = 'AxesHelper';

        }

        setColors( xAxisColor, yAxisColor, zAxisColor ) {
            yAxisColor = yAxisColor || xAxisColor;
            zAxisColor = zAxisColor || xAxisColor;

            const color = new THREE.Color();
            const array = this.geometry.attributes.color.array;

            color.set( xAxisColor );
            color.toArray( array, 0 );
            color.toArray( array, 3 );

            color.set( yAxisColor );
            color.toArray( array, 6 );
            color.toArray( array, 9 );

            color.set( zAxisColor );
            color.toArray( array, 12 );
            color.toArray( array, 15 );

            this.geometry.attributes.color.needsUpdate = true;

            return this;

        }

        dispose() {

            this.geometry.dispose();
            this.material.dispose();

        }

        toggle(toggle) {
            this.visible = Stoggle === undefined
                ? !this.visible
                : !!toggle;
        }

        toggleSpacing(toggle) {
            this.spacingIndicator = toggle === undefined
                ? !this.spacing
                : !!toggle;

            if(this.spacingIndicator)
                this.spacingHelper();
            else
                this.setVertices();
        }
        spacingHelper(spacing = 50, width = 3) {
            const vertices = [];
            let j = 0;
            for(let i = -this.size/10; i <= this.size/10; i += spacing) {
                if(i == 0)
                    continue;

                vertices.push(
                    -width * 2 * ((j % 2) + 1) , i, 0,
                    0, i, 0
                );

                j += 1;
            }

            this.setVertices(vertices);
        }

        setVertices(arr = []) {
            const array = [...this.ogVertices, ...arr];
            this.geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( array, 3 ) );
        }

        update() {
            if(this.spacingIndicator && this.camera) {
                if(this.camera.perspective == "perspective"){
                    const worldCameraPos = this.camera.selectedCamera.getWorldPosition(new THREE.Vector3());
                    const dist = this.position.distanceTo(worldCameraPos);

                    
                    const width = dist/50;
    
                    this.spacingHelper(50, width);

                } else if(this.camera.perspective == "orthographic"){
                    const width = .32 / this.camera.selectedCamera.zoom;
    
                    this.spacingHelper(50, width);
                }
            }

        }
        
    }
    static axesHelper = new SpaceCAD.AxesHelper();

    static Text = class extends SpaceCAD.Object {
        constructor(prop = {}) {
            const defaultProp = {
                text: "text",
                fontSize: 48,
                font: `Arial`,
                align: "center",
                color: "white",
                background: cssVar.primary,
                borderRadius: 2,
                border: [3, cssVar.tertiary],
                padding: 5,
            }
            prop = recursiveProxy(prop, {
                ...defaultProp,
                awaysLooking: false,
                resolution: 10,
            });

            const setText = (origin = prop) => {
                const text = origin.text;
                const fontSize = origin.fontSize;
                const originFont = origin.font;
                const textAlign = origin.align;
                const color = origin.color;

                const font = `${fontSize * origin.resolution}px ${originFont}`;

                const canvas = auxCanvas();
                const { ctx } = canvas;

                ctx.font = font;

                const lines = String(text).split("\n");
                const padding = origin.padding * origin.resolution;
                const lineHeight = fontSize * 1.2 * origin.resolution;

                const width = Math.ceil(
                    Math.max(...lines.map(line => ctx.measureText(line).width)) +
                    padding * 2
                );

                const height = Math.ceil(
                    lines.length * lineHeight +
                    padding * 2
                );

                canvas.width = width;
                canvas.height = height;
                
                const borderWidth = origin.border[0] * origin.resolution;
                const borderColor = origin.border[1];

                ctx.beginPath();

                ctx.roundRect(
                    borderWidth / 2,
                    borderWidth / 2,
                    width - borderWidth,
                    height - borderWidth,
                    origin.borderRadius * origin.resolution
                );

                ctx.fillStyle = origin.background;
                ctx.fill();

                ctx.lineWidth = borderWidth;
                ctx.strokeStyle = borderColor;
                ctx.stroke();


                ctx.fillStyle = color;
                ctx.textAlign = textAlign;

                ctx.font = font;
                ctx.fillStyle = color;
                ctx.textAlign = textAlign;

                ctx.textBaseline = "middle";

                const x =
                    textAlign === "left" ? padding :
                    textAlign === "right" ? width - padding :
                    width / 2;

                lines.forEach((line, i) => {
                    ctx.fillText(
                        line,
                        x,
                        padding + lineHeight * (i + 0.5)
                    );
                });

                const texture = new THREE.CanvasTexture(canvas);

                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                });

                const backMaterial = material.clone();
                backMaterial.map = texture.clone();
                backMaterial.map.wrapS = THREE.RepeatWrapping;
                backMaterial.map.repeat.x = 1;
                backMaterial.map.needsUpdate = true;

                const geometry = new THREE.PlaneGeometry(width / origin.resolution, height / origin.resolution);

                return {
                    material,
                    backMaterial,
                    geometry,
                    height,
                    width
                };
            };
            
            const ogText = setText(prop);
            const {material, geometry} = ogText;
            super(prop, geometry, material);

            this.space(() => {
                this.back = new SpaceCAD.Mesh(geometry, ogText.backMaterial);
            })
            this.back.rotation.y = Math.PI;
            this.back.position.z = -.001;

            const setTextReactiveProperty = (key) => {
                this[key] = this[`_${key}`] = prop[key];

                Object.defineProperty(this, key, {
                    get: () => this[`_${key}`],
                    set: value => {
                        this[`_${key}`] = value;
                        
                        const {material, backMaterial, geometry, width, height} = setText(this);
                        this.width = width;
                        this.height = height;
                        this.material = material;
                        this.geometry = geometry;
                        
                        this.back.geometry = geometry;
                        this.back.material = backMaterial;
                    }
                })
            }

            Object.keys(defaultProp).forEach(setTextReactiveProperty);
            

            this.width = ogText.width;
            this.height = ogText.height;
            this.resolution = prop.resolution;

            this.awaysLooking = prop.awaysLooking;
        }

        update() {
            if(this.awaysLooking) {
                this.lookAt(camera.selectedCamera.worldPosition);
            }
        }
    }

    // TODO: SPACE CAD

    // HINTER -> LINE AND TEXT AT END POSITION
    // HINTER UPDATE -> AWAYS LOOK AT CAMERA, TEXT AWAYS OUTSIDE OF LINE WAY


    // OBJECT HINTER -> LINE FROM OBJECT WITH TEXT (NAME, SIZE, MORE INFO)
    // OBJECT HINTER UPDATE -> AWAYS LOOK AT CAMERA, AWAYS SHOW OR SHOW ONMOUSEOVER OR DISABLED
    
    // TODO: SPACE CAD



    static edgeHilighting = false;
    static toggleEdgeHilight = (toggle) => {
        SpaceCAD.edgeHilighting = toggle === undefined
            ? !SpaceCAD.edgeHilighting
            : !!toggle;

        SpaceCAD.Mesh.instances.forEach(mesh => {
            mesh.toggleEdgeHilighting(SpaceCAD.edgeHilighting);
        });
    }



    static setPosition = (...args) => {
        args = args[0] instanceof THREE.Vector3 ? args[0] :
            args.length == 0 ? new THREE.Vector3(0, 0, 0) : new THREE.Vector3(...args);
            
        const obj = new SpaceCAD.Group();
        obj.setPosition(...args);
        return obj;
    }
    static setPos = SpaceCAD.setPosition;
    static setRotation = (...args) => {
        const obj = new SpaceCAD.Group();
        obj.setRotation(...args);
        return obj;
    }
    static setRot = SpaceCAD.setRotation;
    static setRotationPI = (...args) => {
        const obj = new SpaceCAD.Group();
        obj.setRotation(...args);
        return obj;
    }
    static setRotPI = SpaceCAD.setRotationPI;
    static setScale = (...args) => {
        const obj = new SpaceCAD.Group();
        obj.setSale(...args);
        return obj;
    }
    static setScl = SpaceCAD.setScale;
    static mirror = (...args) => {
        const obj = new SpaceCAD.Group();
        obj.scale.set(...args);
        return obj;
    }
}

return SpaceCAD;

});

const THREE = window.THREE;

// PRESETTING THREE
function getDirection () {
    const object = this;

    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();

    object.getWorldDirection(forward);
    right.setFromMatrixColumn(object.matrixWorld, 0);
    up.setFromMatrixColumn(object.matrixWorld, 1);

    forward.negate();
    const backward = forward.clone().negate();
    const left = right.clone().negate();
    const down = up.clone().negate();

    const setReturn = (value, direction) =>{
        if(!(value instanceof THREE.Vector3)) throw new Error("value must be a THREE.Vector3");
        object.lookAt(direction);
    }
    const returnObject = {};
    Object.defineProperties(returnObject, {
        forward: { get: () => forward, set: () => {} },
        backward: { get: () => backward, set: () => {} },
        right: { get: () => right, set: () => {} },
        left: { get: () => left, set: () => {} },
        up: { get: () => up, set: () => {} },
        down: { get: () => down, set: () => {} },
    })

    return returnObject;
}
function isAboveMouse (camera) {
    camera = this.ownerCamera || this.pivotCamera?.selectedCamera || camera;
    if(!camera) return {intersects: false, direct: false, indexOf: -1, list: [], error: "camera not found"};

    const mouse = new THREE.Vector2();

    mouse.x = (mousePosition.x / window.innerWidth) * 2 - 1;
    mouse.y = -(mousePosition.y / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const list = raycaster
        .intersectObjects(camera.originScene.children, true)
        .filter(intersect => {
        let obj = intersect.object;

        while (obj) {
            if (!obj.visible)
                return false;

            obj = obj.parent;
        }

        return true;
    });

    let intersects = false;
    let direct = false;
    let indexOf = -1;

    if (list.length) {
        const found = list.find(intersect => intersect.object == this);

        if (found) {
            intersects = true;
            indexOf = list.indexOf(found);
        }

        if (list[0].object == this) {
            direct = true;
            intersects = true;
            indexOf = 0;
        }
    }

    return {
        intersects,
        direct,
        indexOf,
        list
    };
}
function isAboveMouseGroup (camera) {
    const list = isAboveMouse.call(this, camera).list;    

    let intersects = false;
    let direct = false;
    let child = null;

    if(list.length) {
        const first = list[0].object;

        let obj = first;

        while(obj) {
            if(obj == this) {
                direct = true;
                intersects = true;
                child = obj;
                break;
            }
            obj = obj.parent;
        }

        if(!intersects) {
            const find = list.find(hit => {
                let obj = hit.object;

                while(obj) {
                    if(obj == this) return true;
                    obj = obj.parent;
                }
                return false;
            });

            if(find) {
                child = find.object;
                intersects = true;
            }
        }
    }

    return {
        intersects,
        direct,
        child,
        list,
    }
}

Object.defineProperties(THREE.Object3D.prototype, {
    directions: {
        get: getDirection,
        set: function () {}
    },
    dir: {
        get: getDirection,
        set: function () {}       
    },
    pos: {
        get: function () { return this.position },
        set: function (value) { this.position.set(value.x, value.y, value.z) },
    },
    rot: {
        get: function () { return this.rotation },
        set: function (value) { this.rotation.set(value.x, value.y, value.z) },
    },
    scl: {
        get: function () { return this.scale },
        set: function (value) { this.scale.set(value.x, value.y, value.z) },
    },
    isMouseOver: {
        get: isAboveMouse,
        set: function () {}
    },
    mouseOver: {
        value: isAboveMouse,
        writable: false,
    },

});
Object.defineProperties(THREE.Group.prototype, {
    isMouseOver: {
        get: isAboveMouseGroup,
        set: function () {}
    },
    mouseOver: {
        value: isAboveMouseGroup,
        writable: false,
    },
});


// THREE OVERLOADING
THREE.Vector2.prototype.__overload_anyArithmetic = function (that, operator) {
    if(that?.x != undefined && that?.y != undefined)
        return new THREE.Vector2(
            operator(this.x, that.x),
            operator(this.y, that.y)
        );
    else if (typeof that === "number")
        return new THREE.Vector2(
            operator(this.x, that),
            operator(this.y, that)
        );
    else
        throw new Error(`Invalid Arithmetic operation between ${typeof this} and ${typeof that}`);
}
THREE.Vector2.prototype.__overload_anyAssignArithmetic = function (that, operator) {
    if(that?.x != undefined && that?.y != undefined) {
        this.x = operator(this.x, that.x);
        this.y = operator(this.y, that.y);
        return this;
    }
    else if (typeof that === "number") {
        this.x = operator(this.x, that);
        this.y = operator(this.y, that);
        return this;
    }
    else
        throw new Error(`Invalid Arithmetic operation between ${typeof this} and ${typeof that}`);
}
THREE.Vector3.prototype.__overload_anyArithmetic = function (that, operator) {
    if(that?.x != undefined && that?.y != undefined && that?.z != undefined)
        return new THREE.Vector3(
            operator(this.x, that.x),
            operator(this.y, that.y),
            operator(this.z, that.z)
        );
    else if (typeof that === "number")
        return new THREE.Vector3(
            operator(this.x, that),
            operator(this.y, that),
            operator(this.z, that)
        );
    else
        throw new Error(`Invalid Arithmetic operation between ${typeof this} and ${typeof that}`);
};
THREE.Vector3.prototype.__overload_anyAssignArithmetic = function (that, operator) {
    if(that?.x != undefined && that?.y != undefined && that?.z != undefined) {
        this.x = operator(this.x, that.x);
        this.y = operator(this.y, that.y);
        this.z = operator(this.z, that.z);
        return this;
    }
    else if (typeof that === "number") {
        this.x = operator(this.x, that);
        this.y = operator(this.y, that);
        this.z = operator(this.z, that);
        return this;
    }
    else
        return new Error(`Invalid Assign Arithmetic operation between ${typeof this} and ${typeof that}`);
};
THREE.Vector4.prototype.__overload_anyArithmetic = function (that, operator) {
    if(that?.x != undefined && that?.y != undefined && that?.z != undefined && that?.w != undefined)
        return new THREE.Vector4(
            operator(this.x, that.x),
            operator(this.y, that.y),
            operator(this.z, that.z),
            operator(this.w, that.w)
        );
    else if (typeof that === "number")
        return new THREE.Vector4(
            operator(this.x, that),
            operator(this.y, that),
            operator(this.z, that),
            operator(this.w, that)
        );
    else
        throw new Error(`Invalid Arithmetic operation between ${typeof this} and ${typeof that}`);
}
THREE.Vector4.prototype.__overload_anyAssignArithmetic = function (that, operator) {
    if(that?.x != undefined && that?.y != undefined && that?.z != undefined && that?.w != undefined){
        this.x = operator(this.x, that.x);
        this.y = operator(this.y, that.y);
        this.z = operator(this.z, that.z);
        this.w = operator(this.w, that.w);
        return this;
    }
    else if (typeof that === "number") {
        this.x = operator(this.x, that);
        this.y = operator(this.y, that);
        this.z = operator(this.z, that);
        this.w = operator(this.w, that);
        return this;
    }
    else
        return new Error(`Invalid Assign Arithmetic operation between ${typeof this} and ${typeof that}`);
}

THREE.Quaternion.prototype.__overload_anyArithmetic = function (that, operator) {
    if(that?.x != undefined && that?.y != undefined && that?.z != undefined && that?.w != undefined)
        return new THREE.Quaternion(
            operator(this.x, that.x),
            operator(this.y, that.y),
            operator(this.z, that.z),
            operator(this.w, that.w)
        );
    else if (typeof that === "number")
        return new THREE.Quaternion(
            operator(this.x, that),
            operator(this.y, that),
            operator(this.z, that),
            operator(this.w, that)
        );
    else
        throw new Error(`Invalid Arithmetic operation between ${typeof this} and ${typeof that}`);
}
THREE.Quaternion.prototype.__overload_anyAssignArithmetic = function (that, operator) {
    if(that?.x != undefined && that?.y != undefined && that?.z != undefined && that?.w != undefined) {
        this.x = operator(this.x, that.x);
        this.y = operator(this.y, that.y);
        this.z = operator(this.z, that.z);
        this.w = operator(this.w, that.w);
        return this;
    }
    else if (typeof that === "number") {
        this.x = operator(this.x, that);
        this.y = operator(this.y, that);
        this.z = operator(this.z, that);
        this.w = operator(this.w, that);
        return this;
    }
    else
        return new Error(`Invalid Assign Arithmetic operation between ${typeof this} and ${typeof that}`);
}

THREE.Euler.prototype.__overload_anyArithmetic = function (that, operator) {
    if(that?.x != undefined && that?.y != undefined && that?.z != undefined)
        return new THREE.Euler(
            operator(this.x, that.x),
            operator(this.y, that.y),
            operator(this.z, that.z)
        );
    else if (typeof that === "number")
        return new THREE.Euler(
            operator(this.x, that),
            operator(this.y, that),
            operator(this.z, that)
        );
    else
        throw new Error(`Invalid Arithmetic operation between ${typeof this} and ${typeof that}`);
};
THREE.Euler.prototype.__overload_anyAssignArithmetic = function (that, operator) {
    if(that?.x != undefined && that?.y != undefined && that?.z != undefined) {
        this.x = operator(this.x, that.x);
        this.y = operator(this.y, that.y);
        this.z = operator(this.z, that.z);
        return this;
    }
    else if (typeof that === "number") {
        this.x = operator(this.x, that);
        this.y = operator(this.y, that);
        this.z = operator(this.z, that);
        return this;
    }
    else
        return new Error(`Invalid Assign Arithmetic operation between ${typeof this} and ${typeof that}`);
};



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

    xhr.open(config.method, url, false); // false = síncrono

    for (const [key, value] of Object.entries(config.headers)) {
        xhr.setRequestHeader(key, value);
    }

    xhr.send(config.body);

    if(xhr.status != 200) {
        console.warn(`Error fetching ${url} - ${xhr.status}: ${xhr.statusText}`);
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
                    console.warn(`Error parsing JSON - ${e}`);
                    ret = null;
                }
                return ret;
            },
            enumerable: false
        },
        text: {
            get: () => xhr.responseText,
            enumerable: false
        }
    });

    return xhr
}




// PROJECT CLASSES
// class - SpaceCAD
class SpaceCAD {
    static store = function (name) {
        let cls = isClass(this)? this : this.constructor;

        if([SpaceCAD, SpaceCAD.Root, SpaceCAD.Mesh, SpaceCAD.Group, SpaceCAD.RootObject, SpaceCAD.Object].includes(cls))
            return console.warn("SpaceCAD cannot be stored");

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
                usage
            })
        })
        

        return this;
    }
    static module = new Proxy(
        function(name) {
            const req = syncFetch(`/store/class/${name}`);

            if (req.error) return;

            const {
                dependencies,
                classBody
            } = req.json;

            return {
                dependencies: dependencies.map(name => SpaceCAD.access(name)),
                class: new Function(
                    `return (${classBody})`
                )()
            };
            
            // loading object
            if(0) { // object
                // fetch object 
                const loader = new THREE.ObjectLoader();
                const object = loader.parse(json);

                return {
                    new: () => scene.add(object)
                }
            }
        },
        {
            get(target, name) {
                return target(name);
            }
        }
    );

    static loadFromObject(obj) {

    }

    static deleteAll = () => SpaceCAD.instances.forEach(instance => instance.delete());
    static run = code => {
        SpaceCAD.deleteAll();
        const fn = new Function(code);
        Overloader.eval(fn);
    }

    static currentSpace = null;

    static instances = [];
    static roots = [];

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
                
            });

            SpaceCAD.instances.push(this);
            
            if(SpaceCAD.currentSpace)
                SpaceCAD.currentSpace.add(this);
            else {
                SpaceCAD.roots.push(this);
                scene.add(this);
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

            this.edgeHilighting = SpaceCAD.edgeHilighting;
            this.toggleEdgeHilighting(this.edgeHilighting);

            SpaceCAD.Mesh.instances.push(this);
        }

        toggleEdgeHilighting (togle) {
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

            this.camera = pivotCamera;
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
            for(let i = -this.size/10, j =0; i <= this.size/10; i += spacing, j++) {
                if(i == 0)
                    continue;

                vertices.push(
                    j%2? -width : -width * 2 , i, 0,
                    0, i, 0
                );
            }

            this.setVertices(vertices);
        }

        setVertices(arr = []) {
            const array = [...this.ogVertices, ...arr];
            this.geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( array, 3 ) );
        }

        update() {
            if(this.spacingIndicator && this.pivotCamera) {
                if(this.pivotCamera.perspective == "perspective"){
                    const worldCameraPos = this.pivotCamera.selectedCamera.getWorldPosition(new THREE.Vector3());
                    const dist = this.position.distanceTo(worldCameraPos);
                    
                    const width = dist/50;
    
                    this.spacingHelper(50, width);

                } else if(this.pivotCamera.perspective == "orthographic"){
                    const width = .32 / camera.selectedCamera.zoom;
    
                    this.spacingHelper(50, width);
                }
            }

        }
        
    }
    static axesHelper = new SpaceCAD.AxesHelper();

    //TODO: SPACE CAD
    // TEXT FROM CANVAS

    // HELPER LINE WITH WIDTH

    // RULER -> LINE AND TEXT (DISTANCE, ANGLE - OPTIONAL)
    // RULER UPDATE -> AWAYS LOOK AT CAMERA

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
        const obj = new SpaceCAD.Group();
        obj.position.setRotation(...args);
        return obj;
    }
    static setPos = SpaceCAD.setPosition;
    static setRotation = (...args) => {
        const obj = new SpaceCAD.Group();
        obj.rotation.setRotation(...args);
        return obj;
    }
    static setRot = SpaceCAD.setRotation;
    static setRotationPI = (...args) => {
        const obj = new SpaceCAD.Group();
        obj.rotation.setRotation(...args);
        return obj;
    }
    static setRotPI = SpaceCAD.setRotationPI;
    static setScale = (...args) => {
        const obj = new SpaceCAD.Group();
        obj.scale.setSale(...args);
        return obj;
    }
    static setScl = SpaceCAD.setScale;
    static mirror = (...args) => {
        const obj = new SpaceCAD.Group();
        obj.scale.mirror(...args);
        return obj;
    }

}


// arrow
class Arrow extends THREE.Group {
    constructor(from, to, color, size = .15) {
        super();
        
        const distance = to.clone().sub(from).length();

        const arrowMaterial = new THREE.MeshBasicMaterial({ color });

        const cylinderSize = size/2.5;
        this.cylinder = new THREE.Mesh(
            new THREE.CylinderGeometry(cylinderSize, cylinderSize, distance, 32),
            arrowMaterial
        );
        this.cone = new THREE.Mesh(
            new THREE.ConeGeometry(size, size*1.5, 32),
            arrowMaterial
        );

        this.preArrowGroup = new THREE.Group();
        this.preArrowGroup.add(this.cylinder);
        this.preArrowGroup.add(this.cone);
        
        this.cylinder.position.set(0, distance/2, 0);
        this.cone.position.set(0, distance + (size * .5), 0);

        this.preArrowGroup.rot.x = Math.PI / 2;
        this.add(this.preArrowGroup);
        this.lookAt(to);

        this.objectList = [
            this.cylinder,
            this.cone,
            this.preArrowGroup,
            this
        ]
    }
}




    
// UI
document.querySelector("#a").addEventListener("click", () => {
    SpaceCAD.toggleEdgeHilight();
});


const scene = new THREE.Scene();
const UIScene = new THREE.Scene();


// pivot camera object
class PivotCamera extends THREE.Object3D {
    static instances = [];

    static updateAll() {
        PivotCamera.instances.forEach(cam => cam.update());
    }

    constructor(scene, perspective = "perspective") {
        super();
        
        this.originScene = scene;
        this.perspective = perspective;

        
        const aspect = window.innerWidth / window.innerHeight;
        const size = 2;

        this.translateObject = new THREE.Object3D();

        this.orthographicCamera = new THREE.OrthographicCamera(
            -size * aspect,
            size * aspect,
            size,
            -size,
            0.1,
            100000
        );
        this.perspectiveCamera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000000
        );
        this.perspectiveCamera.originScene = this.orthographicCamera.originScene = scene;
        this.translateObject.add(this.perspectiveCamera);
        this.translateObject.add(this.orthographicCamera);


        this.selectedCamera = this.perspective == "perspective" ?
            this.perspectiveCamera:
            this.orthographicCamera;

        this.add(this.translateObject);
        scene.add(this);

        PivotCamera.instances.push(this);
    }

    setZoom(value) {        
        if(this.perspective == "perspective") {
            this.translateObject.position.set(0, 0, value);

        } else if(this.perspective == "orthographic") {
            this.translateObject.position.set(0, 0, 1000);
            this.orthographicCamera.zoom = (window.__auxOrthoZoom || 13) / value;
            this.orthographicCamera.updateProjectionMatrix();
        }
    }

    copyFrom(pivotCamera) {
        this.perspective = pivotCamera.perspective;
        this.position.copy(pivotCamera.position);
        this.rotation.copy(pivotCamera.rotation);        
    }

    update() {
        const aspect = window.innerWidth / window.innerHeight;

        if (this.perspective == "perspective") {
            this.selectedCamera = this.perspectiveCamera;
            this.selectedCamera.aspect = aspect;

        } else if (this.perspective == "orthographic") {
            this.selectedCamera = this.orthographicCamera;
            const size = 10;

            this.selectedCamera.left = -size * aspect;
            this.selectedCamera.right = size * aspect;
            this.selectedCamera.top = size;
            this.selectedCamera.bottom = -size;
        }

        this.selectedCamera.updateProjectionMatrix();
    }
}
// CAMERAS
const camera = new PivotCamera(scene);
const UICamera = new PivotCamera(UIScene);

camera.position.set(20, 20, 10);

camera.rotation.order = "YXZ";


// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
const canvas = renderer.domElement;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const pmremGenerator = new THREE.PMREMGenerator(renderer);
const environmentMap = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.04
).texture;

scene.environment = environmentMap;
UIScene.environment = environmentMap;


/* 
use to create textures
*/
const auxCanvas = (sizeX = 256, sizeY = 256) => {
    const canvas = document.createElement("canvas");
    canvas.width = sizeX;
    canvas.height = sizeY;

    canvas.ctx = canvas.getContext("2d");

    return canvas;
}


// WORLD OBJECTS
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(5, 10, 5);

scene.add(light);


SpaceCAD.axesHelper.toggleSpacing(1);
SpaceCAD.axesHelper.pivotCamera = camera;
scene.add(SpaceCAD.axesHelper);
















// custom object

const {
    mesh, group, setPosition, setPos, setRotation, setRot, setScale, setScl, mirror
} = SpaceCAD;


// FAZER OBJETOS FICAREM COM ARESTAS VISIVEIS
class Metalom extends SpaceCAD.Object {
    static instances = [];
    
    static defaultGlobalSettings = {
        color: "#000000",
        roughness: .2,
        metalness: 0
    };
    static globalSettings = { ...Metalom.defaultGlobalSettings }

    static globalSettings(prop) {
        Metalom.globalSettings = {
            ...Metalom.defaultGlobalSettings,
            ...prop
        }
    }
    static restoreSettings() {
        Metalom.globalSettings = {
            ...Metalom.defaultGlobalSettings
        }
    }

    constructor(prop = {}) {
        prop = recursiveProxy(prop, {
            width: 50,
            type: [20,20],
            ...Metalom.globalSettings,
            cap: false, 
            capTop: false,
            capBottom: false,
            cutTop: 0,
            cutBottom: 0,
        });

        prop.cap = prop.capTop && prop.capBottom? true : prop.cap;

        const metalomShape = (pWidth, pHeight, pDepth) => {
            const getIntersection = (y, angle) => {
                angle = THREE.MathUtils.degToRad(angle);

                return y / Math.tan(angle)
            }
            

            const shape = new THREE.Shape();

            const w = pWidth;
            const h = pHeight;

            const bottom = prop.cutBottom;
            const top = prop.cutTop;

            let bottomX = 0;
            let topX = w;

            if (bottom !== 0) {
                const x = getIntersection(h, bottom);

                bottomX = -x;
            }

            if (top !== 0) {
                const x = getIntersection(h, top);

                topX = -x;
            }

            shape.moveTo(bottomX > 0? bottomX: 0, 0);

            shape.lineTo(w - (topX == w? 0: topX > 0? topX : 0), 0);
            shape.lineTo(w - (topX > 0? 0 : -topX), h);
            shape.lineTo(0 + (bottomX > 0? 0 : -bottomX), h);
            

            shape.closePath();

            const geometry = new THREE.ExtrudeGeometry(shape, {
                depth: pDepth,
                bevelEnabled: false
            });

            geometry.clearGroups();

            geometry.addGroup(0, 12, 0);  // frente/trás
            geometry.addGroup(12, 6, 1);  // bottom
            geometry.addGroup(18, 6, 2);  // right
            geometry.addGroup(24, 6, 3);  // top
            geometry.addGroup(30, 6, 4);  // left



            // criar materiais
            const material = new THREE.MeshStandardMaterial(defaultFace);

            const capBottom = new THREE.MeshStandardMaterial({
                ...defaultFace,
                transparent: !prop.capBottom,
                opacity: prop.capBottom ? 1 : 0
            });

            const capTop = new THREE.MeshStandardMaterial({
                ...defaultFace,
                transparent: !prop.capTop,
                opacity: prop.capTop ? 1 : 0
            });

            return {
                geometry,
                materials: [
                    material,
                    material,
                    capTop,
                    material,
                    capBottom,
                ]
            };
        };

        
        const defaultFace = {
            color: prop.color,
            side: !prop.cap ? THREE.DoubleSide : THREE.FrontSide,
            roughness: prop.roughness,
            metalness: prop.metalness
        }

        const {geometry, materials} = metalomShape(prop.width, prop.type[0], prop.type[1]);

        super(prop, geometry, materials);

        this._width = this.width = prop.width;

        
        this._metalomType = this.metalomType = prop.type;
        this.name = `Metalom - ${this.metalomType[0]}x${this.metalomType[1]}`;

        Object.defineProperties(this, {
            metalomType: {
                get: () => this._metalomType,
                set: (value) => {
                    if(!Array.isArray(value)) throw new Error("value must be an array");
                    this.geometry = metalomShape(this.width, value[0], value[1]).geometry;
                    this._metalomType = value;
                }
            },
            width: {
                get: () => this._width,
                set: (value) => {
                    if(typeof value !== "number") throw new Error("value must be a number");
                    this.geometry = metalomShape(value, this.metalomType[0], this.metalomType[1]).geometry;
                    this._width = value;
                }
            },
            
        })

        Metalom.instances.push(this);
    }
}
const metalom = (...args) => new Metalom(...args);








// USER INTERFACE AND INTERACTIONS
const cursor = document.querySelector('#tempCursor').style;
const setCursor = url => {
    cursor.backgroundImage = `url(/cursor/${url})`;
}

const mouseLock = new MouseLock(canvas);
const lockMouse = (tempCursor = false) => {
    if(tempCursor) {
        cursor.display = 'block';
        cursor.left = `${mousePosition.x}px`;
        cursor.top = `${mousePosition.y}px`;
    }

    mouseLock.lock();
}
const unlockMouse = () => {
    document.querySelector('#tempCursor').style.display = 'none';

    //mouseLock.unlock();
}

const raycaster = new THREE.Raycaster();
const cameraMoveToMouse = () => {
    const mouse = new THREE.Vector2();

    mouse.x = (mousePosition.x / window.innerWidth) * 2 - 1;
    mouse.y = -(mousePosition.y / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera.selectedCamera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length) {
        camera.position.copy(intersects[0].point)
    }
};


const uiOverlayMaterial = new THREE.MeshStandardMaterial();
uiOverlayMaterial.depthTest = false;  
uiOverlayMaterial.depthWrite = false;  


const UI = new THREE.Group();
camera.UI = UI;
const UIDistance = 10;
UI.position.set(0, 0, -UIDistance);
UICamera.add(UI);

class Gizmo {
    static instances = [];
    static updateAll() {
        Gizmo.instances.forEach(gizmo => gizmo.update?.());
    }
    constructor() {
        Gizmo.instances.push(this);
    }

    static Root = CLASS => class extends CLASS {
        constructor(...args) {
            super(...args);
            Gizmo.instances.push(this);
        }
    }
}

class DirectionGizmo extends Gizmo.Root(THREE.Group) {
    static instances = [];
    constructor(camera, config = {}) {
        super();
        this.camera = camera;
        this.visible = true;
        this.ignoreFidgetHiding = false;

        this.fidgetConfig = config = recursiveProxy(config, {
            hideBackfacingFidgets: true,
            x: {
                color: "#ff0000",
            },
            y: {
                color: "#00ff00",
            },
            z: {
                color: "#0000ff",
            },
        });

        
        const setupKey = ([x, y, z]) => {
            const obj = {x, y, z};
            const setup = ([name, value]) => value? name + (value<0?"R": "") : ""; 
            const setupOrder = str => [...str].map(c => [c, obj[c]]).map(setup).join("");

            const aux = [
                setupOrder("xyz"),
                setupOrder("yxz"),
                setupOrder("zyx"),
                setupOrder("yzx"),
                setupOrder("zxy"),
                setupOrder("xzy"),
            ];

            const returnArr = [];

            aux.forEach(a => {
                if(!returnArr.find(b => b == a)) 
                    returnArr.push(a);
            });

            return returnArr;
        }

        const GizmoArrow  = (direction, color) => {
            const objects = new Arrow(new THREE.Vector3(), new THREE.Vector3(...direction), color);
            objects.objectList.forEach(obj => obj.isGizmoObject = true);
            
            const obj = objects.objectList[3];
            obj.gizmoDirection = new THREE.Vector3(...direction);
            obj.getAxisScreenDirection = () => getAxisScreenDirection(obj, [0, 0, 1], camera.selectedCamera);

            obj.fidgetType = "arrow";
            obj.pivotCamera = camera;

            obj.gizmoKeys = setupKey(direction);

            const auxThis = this;
            obj.oppositeFidgets = function (callback) {
                const list = [auxThis.getFromArr(direction.map(x => -x))];

                if(!callback) return list;

                list.forEach(callback);
            }

            obj.getAngle = function () {
                const { direction, facingCamera } = this.getAxisScreenDirection();

                if(facingCamera) 
                    return { facingCamera: true, angle: null };

                let angle = Math.atan2(direction.y, direction.x) * 180 / Math.PI;

                angle = (angle + 180) % 360;

                return {
                    angle,
                    facingCamera
                };
            }
            obj.toDirection = function () {
                const {angle, facingCamera} = this.getAngle();

                if (facingCamera) return null;
                
                if (angle >= 67.5 && angle < 112.5)
                    return new THREE.Vector2(0, -1);      // bottom

                if (angle >= 247.5 && angle < 292.5)
                    return new THREE.Vector2(0, 1);     // top

                if (angle >= 112.5 && angle < 157.5)
                    return new THREE.Vector2(-1, 1);     // top left

                if (angle >= 22.5 && angle < 67.5)
                    return new THREE.Vector2(-1, -1);      // bottom left

                if (angle >= 157.5 && angle < 202.5)
                    return new THREE.Vector2(1, 0);     // left

                if (angle >= 292.5 && angle < 337.5)
                    return new THREE.Vector2(1, 1);    // top left

                if (angle >= 337.5 || angle < 22.5)
                    return new THREE.Vector2(-1, 0);      // right

                if (angle >= 202.5 && angle < 247.5)
                    return new THREE.Vector2(1, -1);     // bottom right
            }
            obj.toCursor = function () {
                const direction = this.toDirection();
                
                let url;

                if ( direction == null )
                    url = "minidot.png";

                else if ( direction.x == 0 && direction.y != 0 )
                    url = "translate_ver.png";
                    
                else if ( direction.x != 0 && direction.y == 0 )
                    url = "translate_hoz.png";
                
                else if ( direction.x > 0 && direction.y > 0  || direction.x < 0 && direction.y < 0 )
                    url = "translate_dia.png";

                else
                    url = "translate_dia_b.png";

                return {
                    url,
                    direction
                };
            }

            return obj;
        }
        const Plane = (colorFrom, colorTo, direction = [0,0,1,1], position = [0,0,0], rotation = [0,0,0],  planeSize = 1) => {
            const createGradient = (from, to, gap = 0) => {
                const canvas = auxCanvas();
                
                const gradient = canvas.ctx.createLinearGradient(
                ...direction.map(x => x * canvas.width)
                );

                gradient.addColorStop(0, from);
                gradient.addColorStop(.5 - gap, from);
                gradient.addColorStop(.5 + gap, to);
                gradient.addColorStop(1, to);

                canvas.ctx.fillStyle = gradient;
                canvas.ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Borda
                canvas.ctx.strokeStyle = "#ffffff";
                const strokeSize = 30;
                canvas.ctx.lineWidth = strokeSize;
                canvas.ctx.strokeRect(
                    1,
                    -strokeSize,
                    canvas.width + strokeSize,
                    canvas.height - 2 + strokeSize
                );

                return new THREE.CanvasTexture(canvas);
            }
            
            const gradient = createGradient(colorFrom, colorTo, .01);

            const createGizmosPlane = () => {
                planeSize *= .8;

                const plane = new THREE.Mesh(
                    new THREE.PlaneGeometry(planeSize, planeSize),
                    new THREE.MeshBasicMaterial({ 
                        map: gradient,
                        side: THREE.DoubleSide
                    }),
                );

                plane.position.set(...position.map(x => x * (planeSize/2) * 2));
                plane.rotation.set(...rotation.map(x => (x * 90) * (Math.PI / 180)));

                return plane;
            }

            const obj = createGizmosPlane();
            obj.isGizmoObject = true;
            obj.fidgetType = "plane";
            obj.pivotCamera = camera;
            obj.gizmoDirection = new THREE.Vector3(...position);

            obj.gizmoKeys = setupKey(position);

            const getOppositeDirection = () => {
                const indexes = position
                    .map((v, i) => v == 0 ? -1: i)
                    .filter(v => v != -1);
                    
                const opposite = [];

                for(let i = -1; i < 2; i += 2)
                    for(let j = -1; j < 2; j += 2) {
                        if(position[indexes[0]] == i && position[indexes[1]] == j) continue;
                        const dir = [0,0,0];
                        dir[indexes[0]] = i;
                        dir[indexes[1]] = j;
                        opposite.push(dir);
                    }

                return opposite;
            }
            const auxThis = this;
            obj.oppositeFidgets = function (callback) {
                const list = getOppositeDirection().map(x => auxThis.getFromArr(x));

                if (!callback) return list;

                list.forEach(callback);
            }

            obj.getDirection = function () {
                const quaternion = this.getWorldQuaternion(
                    new THREE.Quaternion()
                );

                const normal = new THREE.Vector3(0, 0, 1)
                    .applyQuaternion(quaternion)
                    .normalize();

                const planePosition = new THREE.Vector3();
                this.getWorldPosition(planePosition);

                const cameraPosition = new THREE.Vector3();
                camera.getWorldPosition(cameraPosition);

                const toCamera = cameraPosition
                    .sub(planePosition)
                    .normalize();

                const trueFront = normal.dot(toCamera) > 0;

                const localDirect = new THREE.Vector3(...position);            

                return {
                    front: trueFront,
                    direction: trueFront
                        ? localDirect
                        : localDirect.clone().negate()
                };
            }
            obj.toCursor = function () {
                const direction = this.getDirection();

                return {
                    url: "translate.png",
                    direction
                };
            }

            return obj;
        }

        const size = .15;
        const planeSize = size * 2.5;

        this.fidgets = [
            GizmoArrow([1,0,0], config.x.color, size),
            GizmoArrow([0,1,0], config.y.color, size),
            GizmoArrow([0,0,1], config.z.color, size),
            
            GizmoArrow([-1,0,0], config.x.color, size), 
            GizmoArrow([0,-1,0], config.y.color, size),
            GizmoArrow([0,0,-1], config.z.color, size),

            Plane(config.y.color, config.x.color, [0,0,1,1], [1,1,0], [0,0,0], planeSize),
            Plane(config.y.color, config.z.color, [1,1,0,0], [0,1,1], [0,1,1], planeSize),
            Plane(config.x.color, config.z.color, [0,0,1,1], [1,0,1], [1,2,1], planeSize),

            Plane(config.y.color, config.x.color, [0,0,1,1], [-1,1,0], [0,0,-1], planeSize),
            Plane(config.y.color, config.z.color, [1,1,0,0], [0,-1,1], [-1,1,1], planeSize),
            Plane(config.x.color, config.z.color, [0,0,1,1], [1,0,-1], [1,2,0], planeSize),

            Plane(config.y.color, config.x.color, [0,0,1,1], [1,-1,0], [0,0,1], planeSize),
            Plane(config.y.color, config.z.color, [1,1,0,0], [0,1,-1], [1,1,1], planeSize),
            Plane(config.x.color, config.z.color, [0,0,1,1], [-1,0,1], [1,2,-2], planeSize),

            Plane(config.y.color, config.x.color, [0,0,1,1], [-1,-1,0], [0,0,-2], planeSize),
            Plane(config.y.color, config.z.color, [1,1,0,0], [0,-1,-1], [2,1,1], planeSize),
            Plane(config.x.color, config.z.color, [0,0,1,1], [-1,0,-1], [1,2,-1], planeSize), 
        ];

        const applyOpacity = (obj, o) => {
            obj.traverse(obj => {
                if (!obj.material) return;

                const materials = Array.isArray(obj.material)
                    ? obj.material
                    : [obj.material];

                materials.forEach(material => {
                    material.transparent = true;
                    material.opacity = o;
                    material.depthTest = false;
                });
            });
        }

        this.applyOpacity = o => applyOpacity(this, o);

        this.fidgets.forEach(fidget => {
            fidget.applyOpacity = o => applyOpacity(fidget, o);
            fidget.gizmoKeys.forEach(key => this[key] = fidget);
        });

        this.add(...this.fidgets);

        Object.defineProperties(this, {
            isMouseOver: {
                get: () => {
                    const axes = {};
                    
                    this.fidgets.forEach(fidget => {
                        axes[fidget.gizmoKeys[0]] = fidget.isMouseOver
                    });

                    const key = Object.keys(axes).find(key => axes[key].intersects);
                    const direct = key && axes[key].direct || false; 
                    const intersects = key && axes[key].intersects || false;
                    const directGizmo = key && this[key];
                    let hitList = key && axes[key].list || [];

                    if(directGizmo) {
                        directGizmo.mouseIsDirect = true;
                    }
                    
                    const intersectsGizmos =
                        hitList.map(hit => hit.object)
                        .filter(obj => obj.isGizmoObject)
                        .map(obj => obj.fidgetType == "Plane"? obj : obj.parent.parent)
                        .filter((obj, i, arr) => arr.indexOf(obj) == i);

                    intersectsGizmos.forEach(gizmo => {
                        gizmo.mouseIsIntersecting = true;
                    });

                    return {
                        key,
                        direct,
                        intersects,
                        directGizmo,
                        intersectsGizmos,
                        hitList
                    }
                },
                set: () => {}
            }
        });
    }

    getFromArr(arr){
        return this.fidgets.find(fidget => 
            fidget.gizmoDirection.x === arr[0] && 
            fidget.gizmoDirection.y === arr[1] && 
            fidget.gizmoDirection.z === arr[2]
        )
    }

    getDirectFidget(persistent = false){
        if(persistent)
            if(this.persistentDirectFidget)
                return this.persistentDirectFidget;
            
        const direct = this.fidgets.find(fidget => fidget.mouseIsDirect);
        this.persistentDirectFidget = direct;

        return direct;
    }
    releaseMantainedFidget(){
        this.persistentDirectFidget = null;
    }
    getIntersectingFidgets(){
        return this.fidgets.filter(fidget => fidget.mouseIsIntersecting);
    }

    update() {
        this.fidgets.forEach(fidget => {
            fidget.mouseIsDirect = false;
            fidget.mouseIsIntersecting = false;
        });

        if(!this.visible) {
            this.visible = false;
            return;
        }
        if(this.ignoreFidgetHiding) return;
        if(!this.fidgetConfig.hideBackfacingFidgets) return;

        this.ignoreFidgetHiding = false;

        // ORTHO

        


        const cameraPos = this.camera.selectedCamera.getWorldPosition(
            new THREE.Vector3()
        );

        const gizmoPos = this.getWorldPosition(
            new THREE.Vector3()
        );

        const cameraDir = cameraPos.sub(gizmoPos).normalize();

        cameraDir.applyQuaternion(
            this.getWorldQuaternion(
                new THREE.Quaternion()
            ).invert()
        );

        const { x, y, z } = cameraDir;

        const setVisibility = (fidget, visible) => {
            fidget.visible = visible;
            fidget.oppositeFidgets().forEach(opposite => opposite.visible = !visible);
        }

        setVisibility(this.x, x > 0);
        setVisibility(this.y, y > 0);
        setVisibility(this.z, z > 0);

        const setPlaneVisibility = (a, b, planes) => {
            const ia = a > 0 ? 0 : 1;
            const ib = b > 0 ? 0 : 1;

            planes.forEach((plane, i) => {
                plane.visible = i === ia * 2 + ib;
            });
        };

        setPlaneVisibility(x, y, [
            this.xy,
            this.xyR,
            this.xRy,
            this.xRyR
        ]);

        setPlaneVisibility(y, z, [
            this.yz,
            this.yzR,
            this.yRz,
            this.yRzR
        ]);

        setPlaneVisibility(x, z, [
            this.xz,
            this.xzR,
            this.xRz,
            this.xRzR
        ]);
    }
}

const worldGizmo = new DirectionGizmo(UICamera, {
    hideBackfacingFidgets: 1
});
worldGizmo.applyOpacity(.7);

UI.add(worldGizmo);



/* 
CREATES A EQUIVALENT TO
element.stye.top / right / bottom / left

USAGE:

// create a ScreenToScene instance, pass in the size of the scene
// the size is used to calculate the offset on the screen width to the Height

const sceneToScreen = new ScreenToScene(7.2);
const myObject = new THREE.Object3D();


const { top, right, bottom, left } = sceneToScreen;
myObject.position.x = left(50); // places teh object close to 50 pixels from the left
myObject.position.y = top(50); // places the object close to 50 pixels from the top

// for a percentage of the screen, equivalent to vw unit or %, use the vw* functions

const { vwLeft, vwRight, vwTop, vwBottom } = sceneToScreen;
myObject.position.x = vwLeft(50); // places the object close to 50% of the screen from the left
myObject.position.y = vwTop(50); // places the object close to 50% of the screen from the top
*/
class ScreenToScene {
    constructor(sceneSize) {
        this.setSize(sceneSize);
        window.addEventListener("resize", () => this.setSize(sceneSize));
    }
    setSize(sceneSize) {
        this.sceneHeight = sceneSize;
        this.sceneWidth = sceneSize * (window.innerWidth / window.innerHeight);
    }
    height() {
        if(camera.perspective == "orthographic")
            return this.sceneHeight * 1.3

        return this.sceneHeight
    }
    width() {
        if(camera.perspective == "orthographic")
            return this.sceneWidth * 1.3;
        return this.sceneWidth;
    }

    vwLeft(vw) {
        return this.left((vw/100) * window.innerWidth);
    }
    vwRight(vw) {
        return this.right((vw/100) * window.innerWidth);
    }
    vwTop(vw) {
        return this.top((vw/100) * window.innerHeight);
    }
    vwBottom(vw) {
        return this.bottom((vw/100) * window.innerHeight);
    }

    left(offset) {
        const porc = offset / window.innerWidth;
        const endPos = ((this.width() * 2) * porc) - this.width();
        return endPos;
    }
    right(offset) {
        return this.left(window.innerWidth - offset);
    }
    top(offset) {
        const porc = offset / window.innerHeight;
        const endPos = ((this.height() * 2) * porc) - this.height();
        return -endPos;
    }
    bottom(offset) {
        return this.top(window.innerHeight - offset);
    }
}
const screenToScene = new ScreenToScene(7.2);






function getScreenDirection(object, camera) {
    const origin = object.getWorldPosition(new THREE.Vector3());

    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(object.getWorldQuaternion(new THREE.Quaternion()));

    const target = origin.clone().add(forward);

    const p1 = origin.clone().project(camera);
    const p2 = target.clone().project(camera);

    const dir = new THREE.Vector2(
        p2.x - p1.x,
        -(p2.y - p1.y)
    );

    const angle = Math.atan2(dir.y, dir.x);

    return angle;
}
function getAxisScreenDirection(object, axis, camera){
    const quaternion = object.getWorldQuaternion(
        new THREE.Quaternion()
    );

    const worldDir = new THREE.Vector3(...axis)
        .applyQuaternion(quaternion)
        .normalize();

    const objectPos = object.getWorldPosition(
        new THREE.Vector3()
    );

    const cameraPos = camera.getWorldPosition(
        new THREE.Vector3()
    );

    const toCamera = cameraPos
        .sub(objectPos)
        .normalize();

    const facing = Math.abs(worldDir.dot(toCamera));

    if (facing > 0.95) {
        return {
            facingCamera: true,
            direction: null
        };
    }

    const p1 = objectPos.clone().project(camera);

    const p2 = objectPos.clone()
        .add(worldDir)
        .project(camera);

    return {
        facingCamera: false,
        direction: new THREE.Vector2(
            p2.x - p1.x,
            p2.y - p1.y
        ).normalize()
    };
}


// fazer gizmo ficar com tamanho expecifico independente da distancia ou zoom da camera
const selection3DGizmo = new DirectionGizmo(camera, {
    x: {color: "#9900ff"},
    y: {color: "#ffff00"},
    z: {color: "#006aff"},
});

selection3DGizmo.pos.y = 5;
selection3DGizmo.pos.x = -1;
selection3DGizmo.pos.z = 15;
selection3DGizmo.scale.multiplyScalar(10);

scene.add(selection3DGizmo);



// INPUT MANAGING
const inputManager = new InputManager(canvas);
const {InputAction} = inputManager;

inputManager.preventDefault = false;
inputManager.button.debug.log = 0;
const movement = new InputAction.Linear3dLerp(.01, "a", "d", "w", "s", "q", "e", { preventDefault: true });
const mouseMovement = inputManager.mouse.delta;
const mousePosition = inputManager.mouse.position;
const lookAtMouse = new InputAction.Button("MouseLeft");
const mouseLeft = new InputAction.ButtonBool("MouseLeft");

const mouseRight = new InputAction.ButtonBool("MouseRight", { preventDefault: true });

const wheelZoom = inputManager.mouse.wheel.delta;

const perspective = new InputAction.Button("p");


let onMouseRotation = false;

let doMouseRotate = true;
let doMouseMove = true;

let zoom = 1000;
let moveSpeed = 1;


let lockSelectionmovement = false; // REMOVER
const overloader = new Overloader((frame, loop) => {

    if(selection3DGizmo.isMouseOver.direct && mouseLeft.get() && !onMouseRotation || lockSelectionmovement) {
        doMouseRotate = false;
        
        // TODO - lembrar de soltar o fidget persistente com DirectionGizmo.releaseMantainedFidget()
        const { url, direction } = selection3DGizmo.getDirectFidget(1).toCursor();

        setCursor(url);
        lockMouse(1);

        let move = 0;

        const {delta} = inputManager.mouse;

        selection3DGizmo.pos.x += delta.x * 0.01;

        lockSelectionmovement = true;
        
    } else {
        // TODO - lembrar de soltar o fidget persistente depois de usar DirectionGizmo.getDirectFidget(true)
        selection3DGizmo.releaseMantainedFidget();
        selection3DGizmo.applyOpacity(.7);
        
        if(selection3DGizmo.getDirectFidget() || lockSelectionmovement) {
            selection3DGizmo.getDirectFidget().applyOpacity(1);
            selection3DGizmo.getDirectFidget().oppositeFidgets(fidget => fidget.applyOpacity(1));
        }
    }
    if(mouseLeft.is("up")) {
        lockSelectionmovement = false;
    }


    // same thing but new way
    /* if(selection3DGizmo.isMouseOver.intersects) {
        const fidget = selection3DGizmo.getIntersectingFidgets();
        fidget.forEach(f => f.applyOpacity(1));
    } */


    










    const gizmoAny = worldGizmo.isMouseOver;

    if(gizmoAny.direct) {
        
        gizmoAny.directGizmo.applyOpacity(1);

        if(gizmoAny.directGizmo.fidgetType == "plane") {
            //console.log(gizmoAny.directGizmo.getDirection());
        }
    }
    else 
        worldGizmo.applyOpacity(.7);

    if(gizmoAny.direct && mouseLeft.get() && !onMouseRotation) {
        doMouseRotate = false;

        const gizmoFidget = gizmoAny.directGizmo;

        const { url, direction } = gizmoFidget.toCursor();

        setCursor(url);
        lockMouse(1);

        let move = 0;

        
        if(gizmoFidget.fidgetType == "plane") {
            const localDir = direction.direction.clone();
            const {front} = direction;
            const camera = worldGizmo.camera;


            const sign = new THREE.Vector3(
                Math.sign(localDir.x),
                Math.sign(localDir.y),
                Math.sign(localDir.z)
            );

            localDir.x = Math.abs(localDir.x);
            localDir.y = Math.abs(localDir.y);
            localDir.z = Math.abs(localDir.z);


            // --------------------------------------------------
            // MOVIMENTO DA TELA
            // --------------------------------------------------

            let localMove;

            const applyMove = (x, y, z) => {

                const v = new THREE.Vector3(
                    x || 0,
                    y || 0,
                    z || 0
                );

                v.applyAxisAngle(
                    new THREE.Vector3(0, 1, 0),
                    camera.rotation.y
                );

                return v;
            };


            // --------------------------------------------------
            // XY
            // --------------------------------------------------

            if (localDir.x && localDir.y) {

                localMove = applyMove(
                    mouseMovement.x,
                    mouseMovement.y,
                    0
                );

                localMove.z = 0;
            }


            // --------------------------------------------------
            // XZ
            // --------------------------------------------------

            else if (localDir.x && localDir.z) {

                localMove = applyMove(
                    mouseMovement.x,
                    0,
                    -mouseMovement.y
                );
            }


            // --------------------------------------------------
            // YZ
            // --------------------------------------------------

            else if (localDir.y && localDir.z) {

                /*
                * NÃO usamos applyMove() aqui.
                *
                * O problema dos planos zRy/zRyR acontece porque
                * o movimento X da tela é transformado pela rotação
                * Y da câmera e depois o componente X é eliminado
                * pelo localDir.
                *
                * Aqui compensamos diretamente essa projeção.
                */

                const angle = camera.rotation.y;
                const cos = Math.cos(angle);

                let horizontal = 0;

                if (Math.abs(cos) > 0.05) {
                    horizontal =
                        -mouseMovement.x / cos;
                }

                localMove = new THREE.Vector3(
                    0,
                    mouseMovement.y,
                    horizontal
                );
            }


            // --------------------------------------------------
            // NENHUM PLANO
            // --------------------------------------------------

            else {

                localMove = new THREE.Vector3();

            }


            // --------------------------------------------------
            // MÁSCARA DO PLANO
            // --------------------------------------------------

            localMove.multiply(localDir);


            // --------------------------------------------------
            // SINAIS DOS EIXOS
            // --------------------------------------------------

            if (sign.x)
                localMove.x *= sign.x;

            if (sign.y)
                localMove.y *= sign.y;

            if (sign.z)
                localMove.z *= sign.z;


            // --------------------------------------------------
            // XZ INVERTIDO
            // --------------------------------------------------

    const keys = gizmoFidget.gizmoKeys;

            if (keys.includes("xz") && !front)
                localMove.z *= -1;

            move = localMove;
            















            
        } else {
            const arrowDirection = new THREE.Vector3(
                ...gizmoFidget.gizmoDirection
            ).normalize();

            let mouseMove = 
                direction == null ? mouseMovement.x + mouseMovement.y : // minidot
                direction.x > 0 && direction.y == 0 ? mouseMovement.x : // right
                direction.x < 0 && direction.y == 0 ? -mouseMovement.x : // left

                direction.x == 0 && direction.y > 0 ? mouseMovement.y : // up
                direction.x == 0 && direction.y < 0 ? -mouseMovement.y : // down
                
                direction.x > 0 && direction.y > 0 ?
                    (mouseMovement.x + mouseMovement.y) / Math.sqrt(2) : // right up
                direction.x > 0 && direction.y < 0 ?
                    (mouseMovement.x - mouseMovement.y) / Math.sqrt(2) : // right down

                direction.x < 0 && direction.y > 0 ?
                    (-mouseMovement.x + mouseMovement.y) / Math.sqrt(2) : // left up
                direction.x < 0 && direction.y < 0 ?
                    (-mouseMovement.x - mouseMovement.y) / Math.sqrt(2) : // left down
                0;

            move = arrowDirection * mouseMove;
        }

        camera.pos += move * 0.1;     
    }

    worldGizmo.rot.x = -camera.rot.x;
    worldGizmo.rot.y = -camera.rot.y;

    worldGizmo.pos.x = screenToScene.left(50);
    worldGizmo.pos.y = screenToScene.bottom(50);


    if(perspective.is("up"))
        camera.perspective = camera.perspective == "perspective" ? "orthographic" : "perspective";


    camera.pos += 
        camera.dir.forward * -(camera.perspective == "perspective" ? movement.get().ver : 0) * moveSpeed +
        camera.dir.right * movement.get().hoz * moveSpeed +
        camera.dir.up * (camera.perspective == "perspective" ? movement.get().dep : -movement.get().ver) * moveSpeed;


    let calcZoom = zoom + wheelZoom.y * .5;
    zoom = calcZoom < 0.001 ? 0.001 : calcZoom;

    camera.setZoom(zoom);

    

    if(mouseLeft.get() && doMouseRotate) {
        onMouseRotation = true;
        setCursor("rotate.png");
        lockMouse(1);
        const sensibility = 0.0035;
        
        camera.rot.y -= inputManager.mouse.delta.x * sensibility;
        camera.rot.x += inputManager.mouse.delta.y * sensibility;

        camera.rot.x = Math.max(
            -Math.PI / 2,
            Math.min(Math.PI / 2, camera.rotation.x)
        );
    } else 
        onMouseRotation = false;

    if(mouseRight.get() && doMouseRotate) {
        setCursor("translate.png");   
        lockMouse(1);      
        let mouseMovSpeed = moveSpeed/2;

        camera.pos +=
            camera.directions.right * mouseMovement.x * mouseMovSpeed +
            camera.directions.up * mouseMovement.y * mouseMovSpeed;
    }

    if(lookAtMouse.is("double")) {
        cameraMoveToMouse();
        unlockMouse();
    }

});

const ENGINE_LOOP = new LOOP.pre(overloader.execute);

const PRE_LOOP = new ENGINE_LOOP.loopBefore(() => {
    SpaceCAD.axesHelper.update();
    UICamera.copyFrom(camera);
    PivotCamera.updateAll();
});

const POST_LOOP = new LOOP.post(() => {
    doMouseMove = true;
    doMouseRotate = true;
    
    Gizmo.updateAll();
    inputManager.update();

    if(!mouseLock.state)
        unlockMouse();
    mouseLock.update();

    renderer.autoClear = false;
    renderer.clear();
    
    renderer.render(scene, camera.selectedCamera);

    renderer.clearDepth();

    renderer.render(UIScene, UICamera.selectedCamera);
});




renderer.setAnimationLoop(LOOP.updateAll);

window.addEventListener("resize", () => {
    UICamera.selectedCamera.updateProjectionMatrix();
    camera.selectedCamera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
});
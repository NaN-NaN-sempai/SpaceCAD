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
    worldPosition: {
        get: function () { return this.getWorldPosition(new THREE.Vector3())},
    }

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
THREE.Object3D.prototype.erase = function () {
    this.traverse(object => {
        object.geometry?.dispose();

        if (Array.isArray(object.material))
            object.material.forEach(material => material.dispose());
        else
            object.material?.dispose();
    });

    this.removeFromParent();
};

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


// GLOBALS
Object.defineProperties(window, {
    v2: {
        value: (...args) => new THREE.Vector2(...args),
    },

    v3: {
        value: (...args) => new THREE.Vector3(...args),
    },

    v: {
        value: (...args) => new THREE.Vector3(...args),
    },

    v4: {
        value: (...args) => new THREE.Vector4(...args),
    },
    v0: {
        get() { return new THREE.Vector3(0, 0, 0) }
    },
    vx: {
        get() { return new THREE.Vector3(1, 0, 0) }
    },
    vy: {
        get() { return new THREE.Vector3(0, 1, 0) }
    },
    vz: {
        get() { return new THREE.Vector3(0, 0, 1) }
    },
});


// arrow
class Arrow3D extends THREE.Group {
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

const logger = new Logger(document.querySelector("#logger .body .list"));



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
            -100000,
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
const cameraDefaultPos = [0, 0, 0];
const cameraDefaultRot = [0, 0, 0];
const cameraDefaultZoom = 2000;
const cameraRot = electronStore.cameraRot || cameraDefaultPos;
const cameraPos = electronStore.cameraPos || cameraDefaultPos;
setInterval(() => {
    electronStore.cameraRot = camera.rotation.toArray();
    electronStore.cameraPos = camera.position.toArray();
    electronStore.cameraPerspective = camera.perspective;
    electronStore.cameraZoom = zoom;
}, 2000);

camera.rotation.set(...cameraRot);
camera.position.set(...cameraPos);
camera.perspective = electronStore.cameraPerspective || "perspective";

const cameraSetDefaultPos = () => {
    camera.position.set(...cameraDefaultPos);
}
const cameraSetDefaultRot = () => {
    camera.rotation.set(...cameraDefaultRot);
}
const cameraSetDefaultZoom = () => {
    zoom = cameraDefaultZoom;
}
const cameraSetDefaultPerspective = () => {
    camera.perspective = "perspective";
}
const cameraSetDefault = () => {
    cameraSetDefaultPos();
    cameraSetDefaultRot();
    cameraSetDefaultZoom();
    cameraSetDefaultPerspective();
}

camera.rotation.order = "YXZ";

scene.camera = camera;


const SpaceCAD = window.SpaceCAD = generateSpaceCAD(scene, logger);

Object.keys(SpaceCAD).filter(e=>!["Object", "run", "instancesUpdate", "deleteAll", "restoreDefaultState"].includes(e)).forEach(key => {
    window[key] = SpaceCAD[key];
});

window.iframeRun = SpaceCAD.run;

Color.GlobalizeNames();
const {color} = Color;





// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
const canvas = renderer.domElement;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const pmremGenerator = new THREE.PMREMGenerator(renderer);
const environmentMap = pmremGenerator.fromScene(
    new THREE.RoomEnvironment(),
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
scene.add(SpaceCAD.axesHelper);














// USER INTERFACE AND INTERACTIONS

electronStore.edgeHilighting = electronStore.edgeHilighting == undefined?
{
    color: "#f27a02",
    width: 1,
    opacity: 1
}:
electronStore.edgeHilighting;
const doEdgesIfToggled = () => {
    const origin = document.query("#showEdges");
    const color = origin.query('[type="color"]').value;
    const width = parseInt(origin.query('.width').value);
    const opacity = parseFloat(origin.query('.opacity').value);

    origin.query(".colorOutput").innerHTML = color;
    origin.query(".widthOutput").innerHTML = width;
    origin.query(".opacityOutput").innerHTML = opacity;

    electronStore.edgeHilighting = {color, width, opacity};

    if(!SpaceCAD.edgeHilighting) return;


    SpaceCAD.toggleEdgeHilight(false);
    SpaceCAD.toggleEdgeHilight(true, color, width, opacity);
}
    
// UI
setupDropdown(document.query("#showEdges"), "contextmenu", [
    createElement("label", e => {
        e.setlang.bottombuttons.edges.options.color$;
        e.on("click", (evt, e) => {evt.stopPropagation()})
        e.append(
            createElement("span", e=>{
                e.classList.add("colorOutput");
                e.innerHTML = electronStore.edgeHilighting?.color || "#f27a02";
                e.css.marginLeft = "10px";
            }),
            createElement("br"),
            createElement("input", e => {
                e.type = "color";
                e.css = {
                    width: "149px",
                    height: "20px",
                    padding: "0px"
                };
                e.value = electronStore.edgeHilighting?.color || "#f27a02";

                e.on("input", doEdgesIfToggled);
            })
        )
    }),
    createElement("hr"),
    createElement("label", e => {
        e.setlang.bottombuttons.edges.options.width$;
        e.on("click", (evt, e) => {evt.stopPropagation()})
        e.append(
            createElement("span", e=>{
                e.classList.add("widthOutput");
                e.innerHTML = electronStore.edgeHilighting?.width || 1;
                e.css.marginLeft = "10px";
            }),
            createElement("br"),
            createElement("input", e => {
                e.type = "range";
                e.min = 1;
                e.max = 10;
                e.value = 1;
                e.step = 1;
                e.value = electronStore.edgeHilighting?.width || 1;
                e.style.width ="100%";
                e.classList.add("width");
                e.on("input", doEdgesIfToggled);
            })
        )
    }),
    createElement("hr"),
    createElement("label", e => {
        e.setlang.bottombuttons.edges.options.opacity$;
        e.on("click", (evt, e) => {evt.stopPropagation()})
        e.append(
            createElement("span", e=>{
                e.classList.add("opacityOutput");
                e.innerHTML = electronStore.edgeHilighting?.opacity || 1;
                e.css.marginLeft = "10px";
            }),
            createElement("br"),
            createElement("input", e => {
                e.type = "range";
                e.min = 0;
                e.max = 1;
                e.value = 1;
                e.step = .01;
                e.value = electronStore.edgeHilighting?.opacity || 1;
                e.style.width ="100%";
                e.classList.add("opacity");
                e.on("input", doEdgesIfToggled);
            })
        )
    })
]);

document.query("#showEdges").on("click", (evt, e) => {
    const color = e.query('[type="color"]').value;
    const width = parseInt(e.query('.width').value);
    const opacity = parseFloat(e.query('.opacity').value);
    SpaceCAD.toggleEdgeHilight(undefined, color, width, opacity);
    
    e.classList.toggle("edgeHiOn", !SpaceCAD.edgeHilighting);
    e.title = SpaceCAD.edgeHilighting? language.bottombuttons.edges.hide : language.bottombuttons.edges.show;
});


// controllers
const generateResourcesDOM = () => {
    const resourcesBody = document.query("#resourcesDisplay .body .list");

    resourcesBody.query(".preSavedLibs").innerHTML = "";
    resourcesBody.query(".preSavedModules").innerHTML = "";
    resourcesBody.query(".addons").innerHTML = "";

    if(SpaceCAD.loadedResources.libs)
    Object.entries(SpaceCAD.loadedResources.libs)
    .forEach(([key, ogVal]) => {
        const value = ogVal.raw;
        const parsed = ogVal.parsed;

        resourcesBody.query(".preSavedLibs").append(
            createElement("div", d => {
                d.classList.add("resourceBody");

                d.append(
                    createElement("div", e => {
                        e.classList.add("resourceName");
                        e.innerText = key;

                        if(value.preload){
                            d.classList.add("preload");
                            e.append(
                                createElement("span", e => {
                                    e.innerText = language.bottombuttons.resources.preload
                                })
                            )
                        }
                        
                        if(parsed) {
                            const type = typeof parsed;
                            
                            e.title = value.addonOrigin? `${language.bottombuttons.resources.addon} ${value.addonOrigin.name}\n${language.bottombuttons.resources.owner} ${value.addonOrigin.owner}\nversion: ${value.addonOrigin.version}` : "";

                            e.append(
                                createElement("span", e => {
                                    e.classList.add("type", type);
                                    e.innerText = language.bottombuttons.resources.types[type] ?? type;
                                }),

                                createElement("br"),

                                ...(value.addonOrigin? [
                                    createElement("span", e => {
                                        e.classList.add("info", "key");
                                        e.setlang.bottombuttons.resources.addon$;
                                    }),
                                    createElement("span", e => {
                                        e.classList.add("info");
                                        e.innerText = value.addonOrigin.name
                                    }),
                                ]: [])
                            )
                        }
                    }),
                    createElement("span", e => {
                        e.classList.add("usage");
                        e.innerHTML = value.usage ?? language.bottombuttons.resources.nousage;
                        if(!value.usage) e.classList.add("nousage");
                    })
                )
            })
        );
    });

    if(SpaceCAD.loadedResources.modules)
    Object.entries(SpaceCAD.loadedResources.modules)
    .forEach(([key, ogVal]) => {
        const value = ogVal.raw;
        const parsed = ogVal.parsed;

        resourcesBody.query(".preSavedModules").append(
            createElement("div", d => {
                d.classList.add("resourceBody");

                d.append(
                    createElement("p", e => {
                        e.classList.add("resourceName");
                        e.innerText = key;


                        if(value.preload){
                            d.classList.add("preload");
                            e.append(
                                createElement("span", e => {
                                    e.innerText = language.bottombuttons.resources.preload
                                })
                            )
                        }
                        
                        if(parsed) {
                            const cls = parsed;

                            e.title = value.addonOrigin? `${language.bottombuttons.resources.addon} ${value.addonOrigin.name}\n${language.bottombuttons.resources.owner} ${value.addonOrigin.owner}\nversion: ${value.addonOrigin.version}` : "";
                            e.append(
                                createElement("span", e => {
                                    e.classList.add("type", "class");
                                    const clsName = Object.getPrototypeOf(cls)?.name;
                                    e.innerText = language.bottombuttons.resources.types[clsName] ?? clsName;
                                }),
                                

                                createElement("br"),

                                ...(value.addonOrigin? [
                                    createElement("span", e => {
                                        e.classList.add("info", "key");
                                        e.setlang.bottombuttons.resources.addon$;
                                    }),
                                    createElement("span", e => {
                                        e.classList.add("info");
                                        e.innerText = value.addonOrigin.name
                                    }),
                                ]: [])
                            )
                        }
                    }),
                    createElement("span", e => {
                        e.classList.add("usage");
                        e.innerHTML = value.usage ?? language.bottombuttons.resources.nousage;
                        if(!value.usage) e.classList.add("nousage");
                    })
                )
            })
        )
    });



    if(SpaceCAD.loadedResources.addons)
    SpaceCAD.loadedResources.addons
    .forEach(ogAddon => {
        const addon = ogAddon.raw;

        resourcesBody.query(".addons").append(
            createElement("div", d => {
                d.classList.add("resourceBody", "preload");

                d.append(
                    createElement("p", e => {
                        e.classList.add("resourceName");
                        e.innerText = addon.name;
                        e.css.paddingLeft = "12px";

                        setupDropdown(e, "contextmenu", createElement("button", e => {
                            e.setlang.bottombuttons.resources.removeaddonbtn$;
                            e.css = {
                                color: "white",
                                background: "red",
                                cursor: "pointer"
                            };

                            e.on("click", () => {
                                syncFetch("/store/addons/"+addon.name);
                                SpaceCAD.setPreloads();
                                generateResourcesDOM();
                                logger.log("addon removed", addon.name);
                            })
                        }))

                        e.append(
                            createElement("span", e => {
                                e.classList.add("preload", "ellipsisOnMax");
                                e.css.var.maxWidth = "70px";
                                e.innerText = e.title = addon.version;
                            }),
                            createElement("br"),
                            createElement("p", e => {
                                e.classList.add("info", "key");
                                e.setlang.bottombuttons.resources.owner$;
                            }),
                            createElement("p", e => {
                                e.classList.add("info");
                                e.innerText = e.title = addon.owner;
                            })
                        )
                    }),        
                    createElement("div", e => {
                        e.classList.add("resourceBody", "preload");
                        const containerscss = {
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "center",
                            flexDirection: "row",
                            gap: "5px",
                        }

                        const setItem = (el, res, type) => {
                            el.classList.add("buttonLike");
                            el.innerText = res.key;

                            const parsed = res.value.parsed;
                            if(parsed) {
                                if(type == "lib" && typeof parsed != "object") return;

                                if(!parsed.usage) return;

                                setupDropdown(el, createElement("pre", e => {
                                    e.classList.add("breaklineOnMax");
                                    e.css.var.maxWidth = "100%";
                                    e.innerHTML = parsed.usage;
                                }));

                                let interval = null;
                                el.on(["mouseenter", "mouseleave"], ({type}, el) => {                                        
                                    if(type == "mouseenter")
                                        interval = setTimeout(() => {
                                            el.dropdownOpen();
                                        }, 500);
                                    else
                                        clearTimeout(interval);
                                })
                            }
                        }
                        
                        e.append(
                            createElement("span", e => {
                                e.classList.add("resourceName");
                                e.setlang.bottombuttons.resources.libs$;
                                e.css.fontSize = "1em";
                                e.css.marginBottom = "10px";
                            }),
                            createElement("br"),
                            createElement("br"),
                            createElement("div", e => {
                                e.css = containerscss;
                                
                                const libs = ogAddon.libs?
                                Object.entries(ogAddon.libs).map(([key, value]) => ({
                                    key,
                                    value
                                })): [];

                                if(libs.length == 0)
                                    libs.push(null);

                                e.append(
                                    ...libs.map(lib => {
                                        if(!lib)
                                            return createElement("span", e => {
                                                e.css.opacity = 0.5;
                                                e.setlang.bottombuttons.resources.nolibs$;
                                            })
                                        return createElement("span", e => {
                                            setItem(e, lib, "lib");
                                        })
                                    })
                                )
                            }),
                            createElement("br"),
                            createElement("span", e => {
                                e.classList.add("resourceName");
                                e.setlang.bottombuttons.resources.modules$;
                                e.css.fontSize = "1em";
                            }),
                            createElement("br"),
                            createElement("br"),
                            createElement("div", e => {
                                e.css = containerscss;
                                
                                const libs = ogAddon.modules?
                                Object.entries(ogAddon.modules).map(([key, value]) => ({
                                    key,
                                    value
                                })): [];

                                if(libs.length == 0)
                                    libs.push(null);

                                e.append(
                                    ...libs.map(lib => {
                                        if(!lib)
                                            return createElement("span", e => {
                                                e.css.opacity = 0.5;
                                                e.setlang.bottombuttons.resources.nomodules$;
                                            })
                                        return createElement("span", e => {
                                            setItem(e, lib, "module");
                                        })
                                    })
                                )
                            }),
                            
                        );
                    })
                )
            })
        )
    });
    
    
    
    if(resourcesBody.query(".preSavedLibs").children.length == 0)
        resourcesBody.query(".preSavedLibs").append(
            createElement("div", e => {
                e.classList.add("resourceBody");

                e.append(
                    createElement("span", e => {
                        e.innerText = language.bottombuttons.resources.nolibs;
                    })
                )
            })
        )
    
    if(resourcesBody.query(".preSavedModules").children.length == 0)
        resourcesBody.query(".preSavedModules").append(
            createElement("div", e => {
                e.classList.add("resourceBody");

                e.append(
                    createElement("span", e => {
                        e.innerText = language.bottombuttons.resources.nomodules;
                    })
                )
            })
        )
    
    if(resourcesBody.query(".addons").children.length == 0)
        resourcesBody.query(".addons").append(
            createElement("div", e => {
                e.classList.add("resourceBody");

                e.append(
                    createElement("span", e => {
                        e.innerText = language.bottombuttons.resources.noaddons;
                    })
                )
            })
        )

    

    // controllers

    setupControllers();
    controllers = [];

}

let controllers = [];
const setupControllers = () => {
    const list = document.query("#controllers .list");
    
    if(controllers.length == 0) {
        list.innerHTML = "";

        list.append(
            createElement("span", e => {
                e.setlang.bottombuttons.controllers.empty$;
            })
        );
    } else {
        list.children.forEach(c => {
            if(controllers.indexOf(c) == -1)
                c.remove();
        });
    }
    
}
electronStore.controllers = electronStore.controllers || {};
const createController = (name, prop) => {
    if(!name) {
        logger.throw.syntax(`controller requires a name`);
    }

    const emptyProp = prop == null;

    const base = {
        reload: true
    }

    const defaultRange = {
        ...base,
        type: "range",
        min: 0,
        max: 1,
        value: 0,
        step: 0.01,
    };
    const defaultText = {
        ...base,
        type: "text",
        value: "",
        minlength: 0,
    };
    const boundry = {
        boundry: true, // if can move if mouse goes out of box
    }
    const defaultLinear = {
        ...base,
        ...boundry,
        type: "linear",
        max: 1000,
        min: -1000,
        value: 0,
    };
    const default2D = {
        ...base,
        ...boundry,
        type: "2d",
        maxX: 1000,
        maxY: 1000,
        minX: -1000,
        minY: -1000,
        value: v0,
    };
    if(typeof prop == "object") {
        if(prop.type == "text")
            prop = recursiveProxy(prop, defaultText);

        if(prop.type == "number")
            prop = recursiveProxy(prop, defaultRange);

        if(prop.type == "2d") {
            prop = recursiveProxy(prop, default2D);

            if(prop.minX > prop.maxX)
                logger.throw("Controller 2D: inconpactible minX and maxX");
            
            if(prop.minY > prop.maxY)
                logger.throw("Controller 2D: inconpactible minY and maxY");
        }

        if(prop.type == "linear")
            prop = recursiveProxy(prop, defaultLinear);

        else 
            prop = recursiveProxy(prop, defaultRange);


    } else {
        prop = defaultRange;
    }
    
    


    const pureValue = () => {
        const input = dom.query("input") || dom.query(".inputObject");
        
        if(input.dataset.type == "2d") {
            const out = dom.query(".inputInfo");
            
            const x = parseFloat(out.query(".xOutput").dataset.rawValue);
            const y = parseFloat(out.query(".yOutput").dataset.rawValue);
            
            return v2(x, y);
        }
        if(input.dataset.type == "linear") {
            const out = dom.query(".inputInfo");
            
            const x = parseFloat(out.query(".valueOutput").dataset.rawValue);
            
            return x;
        }
        if(input.type == "color") 
            return color(input.value);
        if(input.type == "checkbox")
            return input.checked;
        else if(["number", "range"].includes(input.type))
            return parseFloat(input.value);
        else
            return input.value;
    }
    const getValue = () => {
        controllers.push(dom);
        
        return pureValue();
    }
    
    const list = document.query("#controllers .list");

    let dom = list.query(`[data-name="${name}"]`);

    if(dom != null) {
        if(dom.dataset.prop != JSHON.stringify(prop) && !emptyProp)
            dom.remove();
        else
            return getValue();
    }


    const propCopy = resolveProxy(prop);


    let storeTimeout;
    const store = (value) => {
        if(isElectron) {
            if(storeTimeout) return value;

            storeTimeout = setTimeout(() => {
                storeTimeout = null;
            }, 500);

            if(electronStore.selectedFile?.path == null) return;
           
            const file = encodeURI(electronStore.selectedFile.path);
            const controller = electronStore.controllers[file] || {};
            
            controller[name] = value;

            electronStore.controllers = {
                ...electronStore.controllers,
                [file]: controller
            }
            
            return value;
        }
        else 
            return;
    }
    if(isElectron && electronStore.selectedFile?.path != null) {
        const file = encodeURI(electronStore.selectedFile.path);
        let storedController = electronStore.controllers[file];

        if(storedController == null) 
            storedController = {};

        if(storedController[name] == null) {
            storedController[name] = 
                prop.type == "2d"?
                    v2(prop.value.x, prop.value.y):
                    prop[prop.type == "checkbox"? "checked": "value"];
        } else {
            prop[prop.type == "checkbox"? "checked": "value"] = storedController[name];
        }

        electronStore.controllers = {
            ...electronStore.controllers,
            [file]: storedController
        };
    }

    
    const propOnChange = () => {
        const delay = prop.inputDelay ?? parseFloat(document.querySelector("#controllers .title .options input").value);

        if(typeof prop.callback == "function")
            prop.callback(pureValue());

        if(window.controllerInputTimeout)
            return;

        if(prop.reload)
            SpaceCAD.runLastCode();

        window.controllerInputTimeout = setTimeout(() => {
            window.controllerInputTimeout = null;
        }, delay);
    }

    dom = createElement("div", e => {
        e.classList.add("controller");
        e.dataset.name = name;
        e.dataset.prop = JSHON.stringify(propCopy);

        e.append(createElement("span", e => {
            e.classList.add("name");

            e.append(
                createElement("span", e => {
                    e.innerHTML = name;
                }),
                createElement("span", e => {
                    e.classList.add("type");
                    e.innerHTML = language.bottombuttons.controllers.inputs.types[prop.type] || prop.type;
                })
            );
        }));

        e.append(createElement("div", e => {
            e.classList.add("inputBody");
            
            e.append(
                ...[
                    // 2d
                    prop.type == "2d" ? 
                    createElement("div", e => {
                        e.classList.add("inputObject");
                        e.dataset.type = "2d";

                        e.append(
                            createElement("div", e => {
                                const margin = 10;
                                const setBG = ({x, y}) => {
                                    e.css.background = `
                                        linear-gradient(var(--primary), var(--primary)) center / 2px 20px no-repeat,
                                        linear-gradient(var(--primary), var(--primary)) center / 20px 2px no-repeat,
                                        linear-gradient(var(--primary), var(--primary)) ${x*100}% ${y*100}% / 2px 100% no-repeat,
                                        linear-gradient(var(--primary), var(--primary)) ${x*100}% ${y*100}% / 100% 2px no-repeat,
                                        ${cssVar.tertiary}
                                    `;
                                };
                                const percent = (n, min, max) => min + parseFloat(n) * (max - min);
                                const rawPercent = (n, min, max) => (parseFloat(n)-min)/(max-min);
                                e.css = {
                                    width: `calc(100% - ${margin * 2}px)`,
                                    height: "200px",
                                    overflow: "hidden",
                                    margin: `${margin}px`,
                                    borderRadius: "10px",
                                    boxShadow: "inset 0 5px 10px rgba(0, 0, 0, 0.5)",
                                    position: "relative",
                                    cursor: "pointer",
                                };

                                setBG({
                                    x: rawPercent(prop.value.x, prop.minX, prop.maxX),
                                    y: rawPercent(-prop.value.y, prop.minY, prop.maxY)
                                });

                                const translateVal = (e, val) => {
                                    const { x, y } = val;

                                    setBG(val);

                                    if(prop.minX != prop.maxX)
                                    e.css.left = `${x * 100}%`;

                                    if(prop.minY != prop.maxY)
                                    e.css.top = `${y * 100}%`;
                                };
                                
                                let dragging = false;
                            

                                const setOutput = (x, y) => {
                                    const out = e.parentElement.parentElement.parentElement.query(".inputInfo");

                                    x = percent(x, prop.minX, prop.maxX);
                                    y = percent(y, prop.minY, prop.maxY);

                                    if (prop.boundry) {
                                        x = Math.max(prop.minX, Math.min(prop.maxX, x));
                                        y = Math.max(prop.minY, Math.min(prop.maxY, y));
                                    }


                                    store({x, y: -y});

                                    out.query(".xOutput").dataset.rawValue = x;
                                    out.query(".xOutput").innerHTML = x.toFixed(2);
                                    out.query(".yOutput").dataset.rawValue = -y;
                                    out.query(".yOutput").innerHTML = -y.toFixed(2);

                                    pureValue();

                                    propOnChange();
                                }

                                let lastX;
                                let lastY;

                                let over = false;
                                const getCord = (evt) => {
                                    const {rect} = e;

                                    let newX = evt.clientX;
                                    let newY = evt.clientY;

                                    if(!prop.boundry)
                                    if(newX < rect.left || newX > rect.right ||
                                        newY < rect.top || newY > rect.bottom) {
                                            if(!over) {
                                                over = true;

                                                e.requestPointerLock();
                                            }

                                            newX = lastX + evt.movementX;
                                            newY = lastY + evt.movementY;
                                    }

                                    lastX = newX;
                                    lastY = newY;

                                    
                                    const maxDom = prop.boundry? 13: 0;
                                    const x = Math.max(
                                        maxDom / rect.width,
                                        Math.min(1 - maxDom / rect.width, (newX - rect.left) / rect.width)
                                    );
                                    const y = Math.max(
                                        maxDom / rect.height,
                                        Math.min(1 - maxDom / rect.height, (newY - rect.top) / rect.height)
                                    );
                                    const rawX = (newX - rect.left) / rect.width;
                                    const rawY = (newY - rect.top) / rect.height;


                                    translateVal(e.children[0], {
                                        x,
                                        y
                                    });

                                    setOutput(rawX, rawY);
                                }
                                e.on("mousedown", (evt) => {
                                    evt.preventDefault();
                                    dragging = true;

                                    getCord(evt);

                                    e.css.cursor = "grabbing";
                                });

                                on("mousemove", (evt) => {
                                    if(!dragging)
                                        return;

                                    getCord(evt);
                                })

                                on("mouseup", (evt) => {
                                    dragging = false;
                                    e.css.cursor = "pointer";

                                    if(over) {
                                        doc.exitPointerLock();
                                        over = false;
                                    }
                                });


                                e.append(
                                    createElement("div", e => {
                                        let x = (prop.value.x - prop.minX) / (prop.maxX - prop.minX) * 100;
                                        let y = (-prop.value.y - prop.minY) / (prop.maxY - prop.minY) * 100;

                                        if(!prop.boundry) {
                                            x = x < 0 ? 0 : x > 100 ? 100 : x;
                                            y = y < 0 ? 0 : y > 100 ? 100 : y;
                                        }

                                        e.css = {
                                            width: "20px",
                                            height: "20px",
                                            background: cssVar.secondary,
                                            borderRadius: "5px",
                                            position: "absolute",
                                            left: x + "%",
                                            top: y + "%",
                                            transform: "translate(-50%, -50%)",
                                            boxShadow: "0 5px 5px rgba(0, 0, 0, 0.5), inset 0 -3px 3px rgba(0, 0, 0, 0.5), inset 0 3px 4px rgba(255, 255, 255, 0.2)",
                                        }
                                    })
                                )
                                
                            })
                        );
                    }):

                    prop.type == "linear" ? 
                    createElement("div", e => {
                        e.classList.add("inputObject");
                        e.dataset.type = "linear";

                        e.append(
                            createElement("div", e => {
                                const max = prop.max || prop.maxX;
                                const min = prop.min || prop.minX;

                                const margin = 10;
                                const percent = (n, min, max) => min + parseFloat(n) * (max - min);
                                e.css = {
                                    width: `calc(100% - ${margin * 2}px)`,
                                    height: "30px",
                                    overflow: "hidden",
                                    margin: `${margin}px`,
                                    borderRadius: "10px",
                                    boxShadow: "inset 0 5px 10px rgba(0, 0, 0, 0.5)",
                                    position: "relative",
                                    cursor: "pointer",
                                    background: `
                                        linear-gradient(var(--primary), var(--primary)) center / 2px 20px no-repeat,
                                        linear-gradient(var(--primary), var(--primary)) 50% 50% / 100% 2px no-repeat,
                                        ${cssVar.tertiary}`
                                };


                                const translateVal = (e, val) => {
                                    if(min != max)
                                    e.css.left = `${val * 100}%`;
                                };
                                
                                let dragging = false;
                            

                                const setOutput = (x) => {
                                    const out = e.parentElement.parentElement.parentElement.query(".inputInfo");

                                    x = percent(x, min, max);

                                    if (prop.boundry) {
                                        x = Math.max(min, Math.min(max, x));
                                    }

                                    store(x);

                                    out.query(".valueOutput").dataset.rawValue = x;
                                    out.query(".valueOutput").innerHTML = x.toFixed(2);

                                    pureValue();

                                    propOnChange();
                                }

                                let lastX = 0;
                                let over;
                                const getCord = (evt) => {
                                    const {rect} = e;

                                    let newX = evt.clientX;

                                    if(!prop.boundry)
                                    if(evt.clientX > rect.right || evt.clientX < rect.left) {
                                        if(!over) {
                                            over = true;

                                            e.requestPointerLock();
                                        }
                                        
                                        
                                        newX = lastX + evt.movementX;
                                    }

                                    lastX = newX;

                                    const maxDom = prop.boundry? 13: 0;
                                    const x = Math.max(
                                        maxDom / rect.width,
                                        Math.min(1 - maxDom / rect.width, (newX - rect.left) / rect.width)
                                    );
                                    const rawX = (newX - rect.left) / rect.width;

                                    translateVal(e.children[0], x);

                                    setOutput(rawX);
                                }
                                e.on("mousedown", (evt) => {
                                    evt.preventDefault();
                                    dragging = true;

                                    getCord(evt);

                                    e.css.cursor = "grabbing";
                                });

                                on("mousemove", (evt) => {
                                    if(!dragging)
                                        return;

                                    getCord(evt);
                                })

                                on("mouseup", (evt) => {
                                    dragging = false;
                                    e.css.cursor = "pointer";

                                    if(over) {
                                        over = false;
                                        doc.exitPointerLock();
                                    }
                                });


                                e.append(
                                    createElement("div", e => {
                                        let x = (prop.value - min) / (max - min) * 100;
                                        x = x < 0 ? 0 : x > 100 ? 100 : x;

                                        e.css = {
                                            width: "20px",
                                            height: "20px",
                                            background: cssVar.secondary,
                                            borderRadius: "5px",
                                            position: "absolute",
                                            left: x + "%",
                                            top: "50%",
                                            transform: "translate(-50%, -50%)",
                                            boxShadow: "0 5px 5px rgba(0, 0, 0, 0.5), inset 0 -3px 3px rgba(0, 0, 0, 0.5), inset 0 3px 4px rgba(255, 255, 255, 0.2)",
                                        }
                                    })
                                )
                                
                            })
                        );
                    }):

                    // general inputs
                    createElement("input", e => {
                        Object.entries(prop).forEach(([key, value]) => {
                            e[key] = value;
                        });
                        e[prop.type == "checkbox"? "checked": "value"] = prop[prop.type == "checkbox"? "checked": "value"]

                        if(prop.type == "text" && e.placeholder == "")
                            e.placeholder = `${name}`;

                        const setOutput = () => {
                            
                            const out = e.parentNode.query(".inputInfo .valueOutput");

                            if(out) {
                                if(e.type == "text")
                                    out.innerHTML = e.value.length || 0;
                                if(e.type == "checkbox")
                                    out.innerHTML = e.checked? 
                                        language.bottombuttons.controllers.inputs.on:
                                        language.bottombuttons.controllers.inputs.off;
                                else
                                    out.innerHTML = e.value || 0;
                            }

                            propOnChange();
                            store(e.value);
                        }
                        
                        setTimeout(() => {
                            setOutput();
                        });                        

                        e.on("input", setOutput);
                    }),
                ],
                createElement("div", e => {
                    const inputInfo = e;
                    e.classList.add("inputInfo");

                    const css = {
                        marginRight: "5px",
                        opacity: 0.5
                    }

                    if(["number", "range"].includes(prop.type)) {
                        e.append(
                            createElement("span", e => {
                                e.append(
                                    createElement("span", e => {
                                        e.classList.add("type");
                                        e.css = css;
                                        e.setlang.bottombuttons.controllers.inputs.min$;
                                    }),
                                    createElement("span", e => {
                                        e.innerHTML = prop.min || 0;
                                    })
                                );
                            }),
                            createElement("span", e => {
                                e.append(
                                    createElement("span", e => {
                                        e.classList.add("type");
                                        e.css = css;
                                        e.setlang.bottombuttons.controllers.inputs.step$;
                                    }),
                                    createElement("span", e => {
                                        e.innerHTML = prop.step || 1;
                                    })
                                );
                            }),
                            createElement("span", e => {
                                e.append(
                                    createElement("span", e => {
                                        e.classList.add("type");
                                        e.css = css;
                                        e.setlang.bottombuttons.controllers.inputs.max$;
                                    }),
                                    createElement("span", e => {
                                        e.innerHTML = prop.max || 0;
                                    })
                                );
                            }),
                            createElement("span", e => {
                                e.append(
                                    createElement("span", e => {
                                        e.classList.add("type");
                                        e.css = css;
                                        e.setlang.bottombuttons.controllers.inputs.value$;
                                    }),
                                    createElement("span", e => {
                                        e.classList.add("valueOutput");
                                        e.innerHTML = prop.value || 0;
                                    })
                                );
                            }),
                        )


                    } else if(["text"].includes(prop.type)) {
                        e.append(
                            createElement("span", e => {
                                e.append(
                                    createElement("span", e => {
                                        e.classList.add("type");
                                        e.css = css;
                                        e.setlang.bottombuttons.controllers.inputs.minlength$;
                                    }),
                                    createElement("span", e => {
                                        e.innerHTML = prop.minlength != null ?
                                        prop.minlength > 0 ? prop.minlength : 0: 0;
                                    })
                                );
                            }),
                            createElement("span", e => {
                                e.append(
                                    createElement("span", e => {
                                        e.classList.add("type");
                                        e.css = css;
                                        e.setlang.bottombuttons.controllers.inputs.length$;
                                    }),
                                    createElement("span", e => {
                                        e.classList.add("valueOutput");
                                        e.innerHTML = prop.value != null ? prop.value.length : 0;
                                    })
                                );
                            }),
                            createElement("span", e => {
                                e.append(
                                    createElement("span", e => {
                                        e.classList.add("type");
                                        e.css = css;
                                        e.setlang.bottombuttons.controllers.inputs.maxlength$;
                                    }),
                                    createElement("span", e => {
                                        e.innerHTML = prop.maxlength || "∞";
                                    })
                                );
                            }),
                        )
                    } else if(["checkbox"].includes(prop.type)) {
                        e.append(
                            createElement("span", e => {
                                e.append(
                                    createElement("span", e => {
                                        e.classList.add("type");
                                        e.css = css;
                                        e.setlang.bottombuttons.controllers.inputs.state$;
                                    }),
                                    createElement("span", e => {
                                        e.classList.add("valueOutput");
                                        e.innerHTML = prop.checked != null ?
                                        prop.checked? 
                                        language.bottombuttons.controllers.inputs.on :
                                        language.bottombuttons.controllers.inputs.off :
                                        language.bottombuttons.controllers.inputs.off;
                                    })
                                );
                            }),
                        )
                    } else if(["color"].includes(prop.type)) {
                        e.append(
                            createElement("span", e => {
                                e.append(
                                    createElement("span", e => {
                                        e.classList.add("type");
                                        e.css = css;
                                        e.setlang.bottombuttons.controllers.inputs.color$;
                                    }),
                                    createElement("span", e => {
                                        e.classList.add("valueOutput");
                                        e.innerHTML = prop.color || "#f27a02";
                                    })
                                );
                            }),
                        )
                    } else if(["2d"].includes(prop.type)) {
                        e.append(
                            createElement("span", e => {
                                e.append(
                                    createElement("span", e => {
                                        e.classList.add("type");
                                        e.css = css;
                                        e.innerHTML = "x:"
                                    }),
                                    createElement("span", e => {
                                        e.classList.add("valueOutput", "xOutput");
                                        e.dataset.rawValue = prop.value.x || 0;
                                        e.innerHTML = (prop.value.x || 0).toFixed(2);
                                    })
                                );
                            }),
                            createElement("span", e => {
                                e.append(
                                    createElement("span", e => {
                                        e.classList.add("type");
                                        e.css = css;
                                        e.innerHTML = "y:"
                                    }),
                                    createElement("span", e => {
                                        e.classList.add("valueOutput", "yOutput");
                                        e.dataset.rawValue = prop.value.y || 0;
                                        e.innerHTML = (prop.value.y || 0).toFixed(2);
                                    })
                                );
                            }),
                        );
                        inputInfo.css.border = "none";
                    } else if(["linear"].includes(prop.type)) {
                        e.append(
                            createElement("span", e => {
                                e.append(
                                    createElement("span", e => {
                                        e.classList.add("type");
                                        e.css = css;
                                        e.setlang.bottombuttons.controllers.inputs.min$;
                                    }),
                                    createElement("span", e => {
                                        e.dataset.rawValue = prop.min || prop.minX || 0;
                                        e.innerHTML = (prop.min || prop.minX || 0).toFixed(2);
                                    })
                                );
                            }),
                            createElement("span", e => {
                                e.append(
                                    createElement("span", e => {
                                        e.classList.add("type");
                                        e.css = css;
                                        e.setlang.bottombuttons.controllers.inputs.max$;
                                    }),
                                    createElement("span", e => {
                                        e.dataset.rawValue = prop.max || prop.maxX || 0;
                                        e.innerHTML = (prop.max || prop.maxX || 0).toFixed(2);
                                    })
                                );
                            }),
                            createElement("span", e => {
                                e.append(
                                    createElement("span", e => {
                                        e.classList.add("type");
                                        e.css = css;
                                        e.setlang.bottombuttons.controllers.inputs.value$;
                                    }),
                                    createElement("span", e => {
                                        e.classList.add("valueOutput");
                                        e.dataset.rawValue = prop.value || 0;
                                        e.innerHTML = (prop.value || 0).toFixed(2);
                                    })
                                );
                            }),
                        );
                    }
                }),
                ...(
                    ["2d"].includes(prop.type)?
                    [ 
                        createElement("div", e => {
                            e.classList.add("inputInfo");

                            const css = {
                                marginRight: "5px",
                                opacity: 0.5
                            }
                            e.append(
                            createElement("span", e => {
                                e.append(
                                    createElement("span", e => {
                                        e.classList.add("type");
                                        e.css = css;
                                        e.setlang.bottombuttons.controllers.inputs.minx$;
                                    }),
                                    createElement("span", e => {
                                        e.classList.add("valueOutput");
                                        e.css.fontSize = ".5rem";
                                        e.innerHTML = e.title = prop.minX || 0;
                                    })
                                );
                            }),
                            createElement("span", e => {
                                e.append(
                                    createElement("span", e => {
                                        e.classList.add("type");
                                        e.css = css;
                                        e.setlang.bottombuttons.controllers.inputs.maxx$;
                                    }),
                                    createElement("span", e => {
                                        e.classList.add("valueOutput");
                                        e.css.fontSize = ".5rem";
                                        e.innerHTML = e.title = prop.maxX || 0;
                                    })
                                );
                            }),
                            createElement("span", e => {
                                e.append(
                                    createElement("span", e => {
                                        e.classList.add("type");
                                        e.css = css;
                                        e.setlang.bottombuttons.controllers.inputs.miny$;
                                    }),
                                    createElement("span", e => {
                                        e.classList.add("valueOutput");
                                        e.css.fontSize = ".5rem";
                                        e.innerHTML = e.title = prop.minY || 0;
                                    })
                                );
                            }),
                            createElement("span", e => {
                                e.append(
                                    createElement("span", e => {
                                        e.classList.add("type");
                                        e.css = css;
                                        e.setlang.bottombuttons.controllers.inputs.maxy$;
                                    }),
                                    createElement("span", e => {
                                        e.classList.add("valueOutput");
                                        e.css.fontSize = ".5rem";
                                        e.innerHTML = e.title = prop.maxY || 0;
                                    })
                                );
                            }),
                        );
                        })
                    ]: []
                )
            )
        }));

    });

    list.append(dom);

    return getValue();
}

const controller = new Proxy({}, {
    get: (obj, prop) => {
        return createController(prop);
    },
    set: (obj, prop, value) => {
        if(typeof value == "object")
        return createController(prop, value);
    }
});


const changePerspectiveButton = document.querySelector("#changePerspective");
const setPerspectiveDom = () => {
    changePerspectiveButton.title = 
        camera.perspective == "perspective" ?
        language.bottombuttons.setperspective.orthographic :
        language.bottombuttons.setperspective.perspective;
    changePerspectiveButton.query("img").src = `./svg/${camera.perspective == "perspective" ? "perpective" : "orthographic"}.svg`;
}
const changePerspective = () => {
    const isPerspective = camera.perspective == "perspective";
    camera.perspective = isPerspective ? "orthographic" : "perspective";
    
    setPerspectiveDom();
}
changePerspectiveButton.on("click", changePerspective);
setPerspectiveDom();

// camera look from rotation
document.query(".bottomItens").all(".cameraLook").on("click", (evt, e) => {
    const direction = e.query("img").alt;

    switch (direction) {
        case "front":
            camera.rotation.set(0, 0, 0);
            break;

        case "back":
            camera.rotation.set(0, Math.PI, 0);
            break;

        case "left":
            camera.rotation.set(0, Math.PI / 2, 0);
            break;

        case "right":
            camera.rotation.set(0, (Math.PI / 2) * 3, 0);
            break;

        case "top":
            camera.rotation.set(Math.PI / 2, 0, 0);
            break;

        case "bottom":
            camera.rotation.set((Math.PI / 2) * 3, 0, 0);
            break;

    }
})




// engine especific
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
            const objects = new Arrow3D(new THREE.Vector3(), new THREE.Vector3(...direction), color);
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

selection3DGizmo.visible = false;

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

const mouseWheel = inputManager.mouse.wheel.delta;
const pinch = inputManager.mouse.pinch;

const perspective = new InputAction.Button("p");


let onMouseRotation = false;

let doMouseRotate = true;
let doMouseMove = true;

let zoom = electronStore.cameraZoom ?? 2000;
let moveSpeed = 10;


scene.children.forEach((obj) => {
    obj.add = ()=>{}
});
const ogSceneAdd = scene.add.bind(scene);

const sceneObjects = [];
scene.add = (obj) => {
    ogSceneAdd(obj);
    sceneObjects.push(obj);
};
const sceneObjectsEmpty = () => {
    sceneObjects.forEach(object => object.erase());
    sceneObjects.length = 0;
};



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
        changePerspective();


    camera.pos += 
        camera.dir.forward * -(camera.perspective == "perspective" ? movement.get().ver : 0) * moveSpeed +
        camera.dir.right * (movement.get().hoz + mouseWheel.x/2) * moveSpeed +
        camera.dir.up * (camera.perspective == "perspective" ? movement.get().dep : -movement.get().ver) * moveSpeed;


    let calcZoom = zoom + (pinch.delta + mouseWheel.y) * 1;
    zoom = calcZoom < 0.001 ? 0.001 : calcZoom;

    camera.setZoom(zoom);

    //console.log(pinch);

    

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
    SpaceCAD.instancesUpdate();
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
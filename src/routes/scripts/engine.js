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
    const mouse = new THREE.Vector2();

    mouse.x = (mousePosition.x / window.innerWidth) * 2 - 1;
    mouse.y = -(mousePosition.y / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const list = raycaster.intersectObjects(camera.originScene.children, true);

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
    mouseOver: {
        value: isAboveMouse,
        writable: false,
    },

});
Object.defineProperties(THREE.Group.prototype, {
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




    
// UI
document.querySelector("#a").addEventListener("click", () => {
    console.clear();
    console.log(123)
})

const scene = new THREE.Scene();
const UIScene = new THREE.Scene();

const setupCamera = (scene, perspective = "perspective") => {
    const camera = new THREE.Object3D();

    camera.perspective = perspective;
    const aspect = window.innerWidth / window.innerHeight;
    const size = 2;

    camera.translateObject = new THREE.Object3D();

    camera.orthographicCamera = new THREE.OrthographicCamera(
        -size * aspect,
        size * aspect,
        size,
        -size,
        0.1,
        10000
    );
    camera.perspectiveCamera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.perspectiveCamera.originScene = camera.orthographicCamera.originScene = scene;
    camera.translateObject.add(camera.perspectiveCamera);
    camera.translateObject.add(camera.orthographicCamera);


    camera.selectedCamera = camera.perspective == "perspective" ?
        camera.perspectiveCamera:
        camera.orthographicCamera;

    camera.add(camera.translateObject);
    scene.add(camera);

    return camera;
}


// CAMERAS
const camera = setupCamera(scene);
const UICamera = setupCamera(UIScene);


// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
const canvas = renderer.domElement;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


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


// TEMP SCENE

scene.background = new THREE.Color(0x87ceeb);

// Luz ambiente
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// Luz direcional (sol)
const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(20, 30, -10);
scene.add(sun);

// Grade
scene.add(new THREE.GridHelper(200, 200));

// Chão
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({
        color: 0x808080,
        roughness: 1
    })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Cubos
for (let x = -40; x <= 40; x += 10) {
    for (let z = -40; z <= 40; z += 10) {
        const cube = new THREE.Mesh(
            new THREE.BoxGeometry(2, 2, 2),
            new THREE.MeshStandardMaterial({
                color: Math.random() * 0xffffff
            })
        );

        cube.position.set(
            x + (Math.random() - 0.5) * 3,
            1,
            z + (Math.random() - 0.5) * 3
        );

        scene.add(cube);
    }
}

// Alguns pilares
for (let i = 0; i < 20; i++) {
    const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x666666 })
    );

    pillar.position.set(
        (Math.random() - 0.5) * 100,
        4,
        (Math.random() - 0.5) * 100
    );

    scene.add(pillar);
}


const cube = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshNormalMaterial()
);
scene.add(cube);


camera.position.set(0, 2, 10);


// INPUT MANAGING
const inputManager = new InputManager(canvas);
const {InputAction} = inputManager;

inputManager.preventDefault = false;
// inputManager.button.debug.log = true;
const movement = new InputAction.Linear3dLerp(.01, "a", "d", "w", "s", "q", "e", { preventDefault: true });
const mouseMovement = inputManager.mouse.delta;
const mousePosition = inputManager.mouse.position;
const lookAtMouse = new InputAction.Button("MouseLeft");
const mouseLeft = new InputAction.ButtonBool("MouseLeft");

const mouseRight = new InputAction.ButtonBool("MouseRight", { preventDefault: true });

const wheelZoom = inputManager.mouse.wheel.delta;

const perspective = new InputAction.Button("p");



camera.rotation.order = "YXZ";

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


const uiOverlay = new THREE.MeshStandardMaterial();
uiOverlay.depthTest = false;  
uiOverlay.depthWrite = false;  


const UI = new THREE.Group();
camera.UI = UI;
const UIDistance = 10;
UI.position.set(0, 0, -UIDistance);
UICamera.add(UI);




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


const arrow = (from, to, color) => {
    const distance = to.clone().sub(from).length();

    const arrowMaterial = new THREE.MeshBasicMaterial({ color });

    const size = .2;
    const cylinderSize = size/2.5;
    const cylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(cylinderSize, cylinderSize, distance, 32),
        arrowMaterial
    );
    const cone = new THREE.Mesh(
        new THREE.ConeGeometry(size, size*1.5, 32),
        arrowMaterial
    );

    const preArrowGroup = new THREE.Group();
    preArrowGroup.add(cylinder);
    preArrowGroup.add(cone);
    
    cylinder.position.set(0, distance/2, 0);
    cone.position.set(0, distance + (size * .5), 0);

    preArrowGroup.rot.x = Math.PI / 2;
    const arrowGroup = new THREE.Group();
    arrowGroup.add(preArrowGroup);
    arrowGroup.lookAt(to);

    return arrowGroup;
}

class DirectionGizmo {
    static Arrow  = (direction, color, camera) => {
        const obj = arrow(new THREE.Vector3(), new THREE.Vector3(...direction), color);
        obj.gizmoDirection = direction;
        obj.getAxisScreenDirection = () => getAxisScreenDirection(obj, [0, 0, 1], camera.selectedCamera);

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
                return new THREE.Vector2(0, 1);      // top

            if (angle >= 247.5 && angle < 292.5)
                return new THREE.Vector2(0, -1);     // bottom

            if (angle >= 112.5 && angle < 157.5)
                return new THREE.Vector2(-1, 1);     // top left

            if (angle >= 22.5 && angle < 67.5)
                return new THREE.Vector2(1, 1);      // top right

            if (angle >= 157.5 && angle < 202.5)
                return new THREE.Vector2(-1, 0);     // left

            if (angle >= 292.5 && angle < 337.5)
                return new THREE.Vector2(-1, -1);    // bottom left

            if (angle >= 337.5 || angle < 22.5)
                return new THREE.Vector2(1, 0);      // right

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
    constructor(camera) {
        this.object = new THREE.Group();

        this.camera = camera;

        this.x = DirectionGizmo.Arrow([1,0,0], 0xff0000, camera);
        this.y = DirectionGizmo.Arrow([0,1,0], 0x00ff00, camera);
        this.z = DirectionGizmo.Arrow([0,0,1], 0x0000ff, camera);

        this.object.add(this.x, this.y, this.z);

        Object.defineProperties(this, {
            position: {
                get: () => this.object.position,
                set: (value) => this.object.position.set(value.x, value.y, value.z)
            },
            pos: {
                get: () => this.object.position,
                set: (value) => this.object.position.set(value.x, value.y, value.z)
            },
            rotation: {
                get: () => this.object.rotation,
                set: (value) => this.object.rotation.set(value.x, value.y, value.z)
            },
            rot: {
                get: () => this.object.rotation,
                set: (value) => this.object.rotation.set(value.x, value.y, value.z)
            }
        });
    }

}

const worldGizmo = new DirectionGizmo(UICamera);// createDirectionGizmo();

UI.add(worldGizmo.object);
    



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

function gizmoToCursor (gizmoDir, camera) {
    const axis = [0, 0, -1];

    const { direction, facingCamera } =
        getAxisScreenDirection(gizmoDir, axis, camera);

    if(facingCamera)
        return "minidot";

    let angle = Math.atan2(direction.y, direction.x) * 180 / Math.PI;

    angle = (angle + 180) % 360;

    if (
        angle >= 67.5 &&
        angle < 112.5 ||
        angle >= 247.5 &&
        angle < 292.5
    ) {
        return "ver";
    }


    if( angle < 22.5 || angle > 337.5 ||
        (angle > 157.5 && angle < 202.5) )
        return "hoz";


    if (angle >= 22.5 && angle < 67.5 ||
        angle >= 202.5 && angle < 247.5) {
        return "dia";
    }

    return "dia_b";
}

let onMouseRotation = false;

let doMouseRotate = true;
let doMouseMove = true;

let zoom = 10;
const overloader = new Overloader((frame, loop) => {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    const gizmoAnyDirect = {
        x: worldGizmo.x.mouseOver(UICamera.selectedCamera),
        y: worldGizmo.y.mouseOver(UICamera.selectedCamera),
        z: worldGizmo.z.mouseOver(UICamera.selectedCamera)
    };
    
    const gizmoAnyKey = Object.keys(gizmoAnyDirect).find(key => gizmoAnyDirect[key].direct);
    if(gizmoAnyKey && mouseLeft.get() && !onMouseRotation) {
        doMouseRotate = false;

        const selectedArrow = worldGizmo[gizmoAnyKey];

        const { url, direction } = selectedArrow.toCursor();

        setCursor(url);
        lockMouse(1);

        const arrowDirection = new THREE.Vector3(
            ...selectedArrow.gizmoDirection
        ).normalize();

        console.log(direction);

        const mouseOperation = 
            direction == null ? inputManager.mouse.delta.x + inputManager.mouse.delta.y : // minidot
            direction.x > 0 && direction.y == 0 ? -inputManager.mouse.delta.x : // right
            direction.x < 0 && direction.y == 0 ? inputManager.mouse.delta.x : // left
            direction.x == 0 && direction.y > 0 ? inputManager.mouse.delta.y : // up
            direction.x == 0 && direction.y < 0 ? -inputManager.mouse.delta.y : // down
            direction.x > 0 && direction.y > 0 ? inputManager.mouse.delta.x - inputManager.mouse.delta.y : // right up
            direction.x > 0 && direction.y < 0 ? inputManager.mouse.delta.x - inputManager.mouse.delta.y : // right down
            direction.x < 0 && direction.y > 0 ? -inputManager.mouse.delta.x + inputManager.mouse.delta.y : // left up
            direction.x < 0 && direction.y < 0 ? -inputManager.mouse.delta.x - inputManager.mouse.delta.y : // left down
            0;

        camera.pos += arrowDirection * mouseOperation * 0.1;       
    }

    worldGizmo.rot.x = -camera.rot.x;
    worldGizmo.rot.y = -camera.rot.y;

    worldGizmo.pos.x = screenToScene.left(50);
    worldGizmo.pos.y = screenToScene.bottom(50);


    if(perspective.is("up"))
        camera.perspective = camera.perspective == "perspective" ? "orthographic" : "perspective";


    let movSpeed = 0.1;
    camera.pos += 
        camera.dir.forward * -(camera.perspective == "perspective" ? movement.get().ver : 0) * movSpeed +
        camera.dir.right * movement.get().hoz * movSpeed +
        camera.dir.up * (camera.perspective == "perspective" ? movement.get().dep : -movement.get().ver) * movSpeed;


    let calcZoom = zoom - wheelZoom.y * 0.1;
    zoom = calcZoom < 0.001 ? 0.001 : calcZoom;

    if(camera.perspective == "perspective") {
        camera.translateObject.position.set(0, 0, zoom);

    } else if(camera.perspective == "orthographic") {
        camera.translateObject.position.set(0, 0, 1000);
        camera.orthographicCamera.zoom = (window.__auxOrthoZoom || 13) / zoom;
        camera.orthographicCamera.updateProjectionMatrix();
    }

    

    if(mouseLeft.get() && doMouseRotate) {
        onMouseRotation = true;
        setCursor("rotate.png");
        lockMouse(1);
        const sensibility = 0.0007;
        
        camera.rot.y -= inputManager.mouse.delta.x * sensibility;
        camera.rot.x -= inputManager.mouse.delta.y * sensibility;

        camera.rot.x = Math.max(
            -Math.PI / 2,
            Math.min(Math.PI / 2, camera.rotation.x)
        );
    } else 
        onMouseRotation = false;

    if(mouseRight.get() && doMouseRotate) {
        setCursor("translate.png");   
        lockMouse(1);      
        let mouseMovSpeed = (window.__auxMouseMovSpeed || 0.05);

        camera.position +=
            camera.directions.right * mouseMovement.x * mouseMovSpeed +
            camera.directions.up * -mouseMovement.y * mouseMovSpeed;
    }

    if(lookAtMouse.is("double")) {
        cameraMoveToMouse();
        unlockMouse();
    }

});

const ENGINE_LOOP = new LOOP.pre(overloader.execute);

const PRE_LOOP = new ENGINE_LOOP.loopBefore(() => {       
    const aspect = window.innerWidth / window.innerHeight;

    if (camera.perspective == "perspective") {
        camera.selectedCamera = camera.perspectiveCamera;
        camera.selectedCamera.aspect = aspect;

        UICamera.selectedCamera = UICamera.perspectiveCamera;
        UICamera.selectedCamera.aspect = aspect;

    } else if (camera.perspective == "orthographic") {
        camera.selectedCamera = camera.orthographicCamera;
        const size = 10;

        camera.selectedCamera.left = -size * aspect;
        camera.selectedCamera.right = size * aspect;
        camera.selectedCamera.top = size;
        camera.selectedCamera.bottom = -size;

        UICamera.selectedCamera = UICamera.orthographicCamera;

        UICamera.selectedCamera.left = -size * aspect;
        UICamera.selectedCamera.right = size * aspect;
        UICamera.selectedCamera.top = size;
        UICamera.selectedCamera.bottom = -size;
    }

    UICamera.pos = camera.pos;
    UICamera.rot = camera.rot;


    camera.selectedCamera.updateProjectionMatrix();
    UICamera.selectedCamera.updateProjectionMatrix();
});

const POST_LOOP = new LOOP.post(() => {
    doMouseMove = true;
    doMouseRotate = true;

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
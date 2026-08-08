const ButtonStateRapidThreshold = 30;


/* 
    USAGE:


*/


/* 
CUSTOM BUTTONS:

MouseMoveAny
MouseMoveUp
MouseMoveDown
MouseMoveLeft
MouseMoveRight

MouseWheelAny
MouseWheelUp
MouseWheelDown
MouseWheelLeft
MouseWheelRight

MousePinchAny
MousePinchIn
MousePinchOut

MouseButtonAny
MouseLeft
MouseRight
MouseMiddle
MouseBack
MouseForward
MouseButton5 [from 5 onwards]


BUTTONS STATES:

down
hold
rapid
double
up



MANAGERS:

// Input Manager has native support for mouse and keyboard.
// But you can also add custom support for others input devices.

let inputManager = new InputManager(myDOMElement);

// Object-based manager
inputManager.addManager({
    managerName: "managerExample", // optional - the manager can be accessed by a property of "inputManager", ex: inputManager.managerExample
    myManagerValue: 0, // any property to use for the manager 
    myManagerValue2: "text", // any property to use for the manager 

    onBrowser: () => { // optional - if the envoironment is a browser, runs once when the manager is added. Useful for adding event listeners
        domElement.addEventListener("keydown", (event) => {
            // do something...
        })
    },

    update: () => { // optional - update the manager, will be called every frame
        // do something...
    },
});

// Class-based manager (recommended)
class MyManager {
    constructor() {
        this.managerName = "managerExample";
        this.myManagerValue = 0;
        this.myManagerValue2 = "text";
    }

    onBrowser() {
        domElement.addEventListener("keydown", (event) => {
            // do something...
        })
    }

    update() {
        // do something...
    }    
}
inputManager.addManager(new MyManager());

// if you need to access the same DOM Element from the inputManager
// you can pass the pass it as parameter and/or by accessing the property "DOMOrigin" from the inputManager
class myManager {
    constructor(parent) {
        this.element = parent.DOMOrigin;
    }
}
inputManager.addManager(new myManager(inputManager));
*/


class InputManager {
    constructor(DOMOrigin) {
        this.preventDefault = false;
        this.preventMouseWheelDefault = false;
        this.preventMousePinchDefault = false;

        this.DOMOrigin = DOMOrigin;

        this.managers = [];

        let thisInputManager = this;
        this.InputAction = class InputAction {
            static Button = class {
                constructor(key, config = {}) {
                    this.key = key;
                    this.config = config;

                    thisInputManager.button.getInput(key, config);
                }

                get() {
                    return thisInputManager.button.getInput(this.key, this.config);
                }

                state() {
                    return thisInputManager.button.getInput(this.key, this.config).state;
                }

                is(state) {
                    return this.state() == state;
                }
            }

            static ButtonInt = class extends InputAction.Button {
                get() {
                    return thisInputManager.button.getInputInt(this.key, this.config);
                }
            }

            static ButtonBool = class extends InputAction.Button {
                get() {
                    return thisInputManager.button.getInputInt(this.key, this.config) > 0;
                }
            }

            static ButtonToggle = class extends InputAction.ButtonBool {
                constructor(key, starts = false, on = "down", config = {}) {
                    super(key, config);

                    this.value = starts;
                    this.activeOn = on;
                    this.threshold = false;
                }

                get() {
                    let button = super.is(this.activeOn);

                    if (button) {
                        if (!this.threshold) {
                            this.threshold = true;
                            this.value = !this.value;
                        }
                    } else {
                        this.threshold = false;
                    }

                    return this.value;
                }

                toggle() {
                    this.value = !this.value;
                }
                set(value) {
                    this.value = value;
                }
            }



            static Linear = class {
                    constructor(negativeKey, positiveKey, config = {}) {
                        this.negative = new InputAction.ButtonInt(negativeKey, {...config});
                        this.positive = new InputAction.ButtonInt(positiveKey, {...config});
                    }

                    get() {
                        let value = this.positive.get(this.positive.config) - this.negative.get(this.negative.config);

                        return value;
                }
            }
            static Axis = InputAction.Linear;

            static LinearLerp = class extends InputAction.Linear {
                constructor(lerpSpeed, negativeKey, positiveKey, config = {}) {
                    let negkey = negativeKey;
                    let poskey = positiveKey;
                    if(typeof negativeKey == "string") {
                        negkey = lerpSpeed;
                        poskey = negativeKey;
                        config = positiveKey;
                        lerpSpeed = .1;
                    }

                    super(negkey, poskey, config);
                    this.lerpSpeed = lerpSpeed;
                    this.currentValue = 0;
                }

                get() {
                    let value = super.get();
                    this.currentValue += (value - this.currentValue) * this.lerpSpeed;
                    return this.currentValue;
                }
                
            }

            static Linear2d = class {
                constructor(negativeXKey, positiveXKey, negativeYKey, positiveYKey, config = {}) {
                    this.hoz = new InputAction.Linear(negativeXKey, positiveXKey, config);
                    this.ver = new InputAction.Linear(negativeYKey, positiveYKey, config);
                }

                get() {
                    return {hoz: this.hoz.get(this.hoz.config), ver: this.ver.get(this.ver.config)};
                }
            }
            static Axis2d = InputAction.Linear2d;
            static Planar = InputAction.Linear2d;

            static Linear2dLerp = class extends InputAction.Linear2d {
                constructor(lerpSpeed = 0.1, negativeXKey, positiveXKey, negativeYKey, positiveYKey, config = {}) {
                    let negXKey = negativeXKey;
                    let posXKey = positiveXKey;
                    let negYKey = negativeYKey;
                    let posYKey = positiveYKey;

                    if(typeof lerpSpeed == "string"){
                        negXKey = lerpSpeed;
                        posXKey = negativeXKey;
                        negYKey = positiveXKey;
                        posYKey = negativeYKey;
                        config = positiveYKey;
                        lerpSpeed = .1;
                    }

                    super(negXKey, posXKey, negYKey, posYKey, config);
                    this.lerpSpeed = lerpSpeed;
                    this.currentValue = { hoz: 0, ver: 0 };
                }

                get() {
                    let targetValue = super.get();

                    // Lerp towards the target value
                    this.currentValue.hoz += (targetValue.hoz - this.currentValue.hoz) * this.lerpSpeed;
                    this.currentValue.ver += (targetValue.ver - this.currentValue.ver) * this.lerpSpeed;

                    return this.currentValue;
                }
            }
            static AxisLerp = InputAction.Linear2dLerp;
            static PlanarLerp = InputAction.Linear2dLerp;

            static Linear3d = class {
                constructor(negativeXKey, positiveXKey, negativeYKey, positiveYKey, negativeZKey, positiveZKey, config = {}) {
                    this.hoz = new InputAction.Linear(negativeXKey, positiveXKey, config);
                    this.ver = new InputAction.Linear(negativeYKey, positiveYKey, config);
                    this.dep = new InputAction.Linear(negativeZKey, positiveZKey, config);
                }

                get() {
                    return { hoz: this.hoz.get(), ver: this.ver.get(), dep: this.dep.get() };
                }
            }
            static Axis3d = InputAction.Linear3d;
            static Spatial = InputAction.Linear3d;

            static Linear3dLerp = class extends InputAction.Linear3d {
                constructor(lerpSpeed = 0.1, negativeXKey, positiveXKey, negativeYKey, positiveYKey, negativeZKey, positiveZKey, config = {}) {
                    let negXKey = negativeXKey;
                    let posXKey = positiveXKey;
                    let negYKey = negativeYKey;
                    let posYKey = positiveYKey;
                    let negZKey = negativeZKey;
                    let posZKey = positiveZKey;

                    if(typeof lerpSpeed == "string"){
                        negXKey = lerpSpeed;
                        posXKey = negativeXKey;
                        negYKey = positiveXKey;
                        posYKey = negativeYKey;
                        negZKey = positiveYKey;
                        posZKey = negativeZKey;
                        config = positiveZKey;
                        lerpSpeed = .1;
                    }

                    super(negXKey, posXKey, negYKey, posYKey, negZKey, posZKey, config);
                    this.lerpSpeed = lerpSpeed;
                    this.currentValue = { hoz: 0, ver: 0, dep: 0 };
                }

                get() {
                    let targetValue = super.get();

                    // Lerp towards the target value
                    this.currentValue.hoz += (targetValue.hoz - this.currentValue.hoz) * this.lerpSpeed;
                    this.currentValue.ver += (targetValue.ver - this.currentValue.ver) * this.lerpSpeed;
                    this.currentValue.dep += (targetValue.dep - this.currentValue.dep) * this.lerpSpeed;

                    return this.currentValue;   
                }
            }
            static AxisLerp3d = InputAction.Linear3dLerp;
            static SpatialLerp = InputAction.Linear3dLerp;

            static LinearMultiple = class {
                constructor(...args) {

                    this.actions = [];

                    for(let i = 0; i < args.length; i += 2) {
                        this.actions.push(new InputAction.Linear(args[i], args[i + 1]));
                    }
                    
                }

                getAll() {
                    return this.actions.map(a => a.get());
                }
                get(index = 0) {
                    return this.actions[index].get();
                }
            }
            static AxisMultiple = InputAction.LinearMultiple;

        };

        // native managers
        this.addManager(new ButtonManager(this));
        this.addManager(new MouseManager(this));
    }

    addManager(manager) {
        this.managers.push(manager);

        if(manager.onBrowser && typeof window != "undefined")
            if(typeof manager.onBrowser == "function")
                manager.onBrowser();

        if(manager.managerName) {
            if(Object.keys(this).includes(manager.managerName))
                console.warn(`The manager name "${manager.managerName}" conflicts with another property of "InputManager". The manager will be craeted without a name.`);
            else
                this[manager.managerName] = manager;

        }
    }

    update() {
        this.managers.forEach(m => m.update?.());
    }
}
class MouseManager {
    constructor(parent = {}) {
        this.parent = parent;
        this.managerName = "mouse";

        this.position = { x: 0, y: 0 };
        this.delta = { x: 0, y: 0 };

        this.wheel = {
            delta: { x: 0, y: 0 },
        }

        this.pinch = {
            delta: 0,
        }
    }

    onBrowser() {
        const DOMOrigin = this.parent.DOMOrigin;
        
        const resetDirection = (dir, name, direction) => {
            if(!directionObjects[name])
                directionObjects[name] = {
                    up: null,
                    down: null,
                    left: null,
                    right: null,
                    in: null,
                    out: null
                };
            let origin = directionObjects[name];

            let input = name + direction;
            let inputAny = name + "Any"

            this.parent.button.emit(input, "down");
            this.parent.button.emit(inputAny, "down");

            clearTimeout(origin[dir]);

            origin[dir] = setTimeout(() => {
                if (["down", "hold"].includes(this.parent.button.getInput(input).state)) {
                    this.parent.button.emit(input, "up");
                    this.parent.button.emit(inputAny, "up");
                }
            }, 100);
        }

        const directionObjects = {};
        const setDirection = (x, y, z, name) => {
            if (x > 0) {
                resetDirection("right", name, "Right");
            } else if (x < 0) {
                resetDirection("left", name, "Left");
            }

            if (y > 0) {
                resetDirection("down", name, "Down");
            } else if (y < 0) {
                resetDirection("up", name, "Up");
            }

            if (z > 0) {
                resetDirection("in", name, "In");
            } else if (z < 0) {
                resetDirection("out", name, "Out");
            }
        }

        DOMOrigin.addEventListener("mousemove", (event) => {
            this.position.x = event.clientX;
            this.position.y = event.clientY;

            this.delta.x = event.movementX;
            this.delta.y = event.movementY;

            setDirection(event.movementX, event.movementY, 0, "MouseMove");
        });

        DOMOrigin.addEventListener("wheel", (event) => {
            this.wheel.delta.y = event.deltaY;
            this.wheel.delta.x = event.deltaX;

            setDirection(event.deltaX, event.deltaY, 0, "MouseWheel");    

        }, { passive: false });

        //pinch
        DOMOrigin.addEventListener("wheel", (event) => {
            if(!event.ctrlKey) return;

            // PREVENT DEFAULT IN SETDIRECTION 
    
            this.pinch.delta = event.deltaY;

            setDirection(0,0, event.deltaY, "MousePinch");
        }, { passive: false });
    }

    update() {
        this.delta.x = 0;
        this.delta.y = 0;

        this.wheel.delta.x = 0;
        this.wheel.delta.y = 0;

        this.pinch.delta = 0;
    }
}
class ButtonClass {
    constructor(key, config = {}) {
        this.key = key;
        this.state = "none";
        this.counter = 0;

        this.config = {
            preventDefault: config.preventDefault ?? false,
        }
    }
}
class ButtonManager {
    constructor(parent = {}) {
        this.parent = parent;
        this.managerName = "button";

        this.inputs = {};
        this.parent = parent;

        this.debug = {
            log: false,
        }
        
        this.config = {
            rapidThreshold: ButtonStateRapidThreshold,
            preventDefault: false,
        }
    }

    onBrowser() {
        const DOMOrigin = this.parent.DOMOrigin;
    
        const emitEvent = (event, state) => {
            let button = typeof event.code == "string" ? event.code : event;
            button = button.replace("Key", "").replace("Digit", "");
            if(button.length == 1) button = button.toLowerCase();
            
            let input = this.getInput(button);
            
            if(this.debug.log) console.log(
            "Input Debug Log:\n%cButton:%c %o\n%cState:%c %o\n%cEvent:%c %o\n%cInput:%c %o",
                "color:orange", "", button,
                "color:orange", "", state,
                "color:orange", "", event,
                "color:orange", "", input
            );

            if(input.config.preventDefault || this.parent.preventDefault) event.preventDefault?.();
            this.emit(button, state);
            this.emit(mouseButtonList.any, state);
        }

        document.addEventListener('keydown', (event) => emitEvent(event, "down"));
        document.addEventListener('keyup', (event) => emitEvent(event, "up"));

        let mouseButtonList = {
            any: "MouseButtonAny",
            0: "MouseLeft",
            1: "MouseMiddle",
            2: "MouseRight",
            3: "MouseBack",
            4: "MouseForward",
        }
        const mouseBtnEvent = (event, state) => {
            let selectedButton = mouseButtonList[event.button];
            let selectedInput = this.getInput(selectedButton);
            if(selectedInput.config.preventDefault || this.parent.preventDefault) event.preventDefault();
            if(selectedButton != undefined)
                emitEvent(selectedButton, state);
            else
                emitEvent("MouseButton" + event.button, state);
        }
        DOMOrigin.addEventListener("mousedown", (event) => mouseBtnEvent(event, "down"));

        DOMOrigin.addEventListener("mouseup", (event) => mouseBtnEvent(event, "up"));

        // remake in ButtonManager for all buttons, not just mouse buttons
        DOMOrigin.addEventListener("dblclick", (event) => mouseBtnEvent(event, "double"));

        DOMOrigin.addEventListener("contextmenu", (event) => {
            let input = this.getInput(mouseButtonList[2]);

            if(this.parent.preventDefault || input.config.preventDefault) event.preventDefault();
        });
    }

    getInput(name, config = {}) {
        if(this.inputs[name] == undefined)
            this.inputs[name] = new ButtonClass(name, config);
        
        if(config.preventDefault != undefined)
            this.inputs[name].config.preventDefault = config.preventDefault;

        return this.inputs[name];
    }

    getInputInt(name, config = {}) {
        let state = this.getInput(name, config).state;

        if(state == "down" || state == "hold" || state == "rapid" || state == "double") return 1;
        if(state == "up" || state == "none") return 0;
        return 0;
    }

    setInputState(name, state) {
        this.getInput(name);

        if(state == "down" && this.inputs[name].state == "hold")
            return;

        this.inputs[name].state = state;
    }

    emit(name, state) {
        this.setInputState(name, state);
    }

    update() {
        for (const key in this.inputs) {
            let input = this.inputs[key];

            if(input.state === "hold" || input.state === "down" || input.state === "double")
                input.counter++;

            if (input.state === "down") {
                input.state = "hold";
                input.counter = 0;

            } else if (input.state === "up")                
                if(input.counter < this.config.rapidThreshold)
                    input.state = "rapid";
                else
                    input.state = "none";

            else if (input.state === "rapid" || input.state === "double") 
                input.state = "none";
        }
    }
}

/* 
    USAGE:

    const myMainLoop = new LOOP((frame, loop) => {
        // your loop code...

        // global frame counter
        frame
        // local frame counter
        loop.frame

        if(condition) lood.disable(); // stops the loop temporarily
        if(condition) loop.enable(); // re-enables the loop
        if(condition) loop.destroy(); // destroys the loop
    });

    // if you want to execute codes before the main loop
    const myPreLoop = new LOOP.pre((frame, loop) => {
        // your pre loop code...
    });

    // or after the main loop
    const myPostLoop = new LOOP.post((frame, loop) => {
        // your post loop code...
    });

    // each new instance of a loop is added to a list of loops that are executed linearly
    // in order: execute the preloop list, then the mainloop list, then the postloop list
    // it is possible to add a loop before or after another in the same list:
    // it will inherit the same type of the selected loop
    
    const myNewLoopBeforeMain = new myMainLoop.loopBefore((frame, loop) => {
        // your new loop code...
    })

    const myNewLoopAfterMain = new myMainLoop.loopAfter((frame, loop) => {
        // your new loop code...
    })

    // the loop must be executed in your main engine as:

    const myEngineLoop = () => {
        // your engine code...

        LOOP.updateAll();
    }

    // rael world example:

    document.requestAnimationFrame(LOOP.updateAll);
*/

let counter = 0;
class LOOP {
    static loops = {
        pre: [],
        loop: [],
        post: []
    }

    static globalFrame = 0;
    static updateAll = () => {
        [
            ...LOOP.loops.pre,
            ...LOOP.loops.loop, 
            ...LOOP.loops.post
        ].forEach(loop => loop.update(LOOP.globalFrame++));
    }
    static pre = class PRE_LOOP extends LOOP {
        constructor(callback) {
            super("pre", callback);
        }
    };
    static loop = LOOP;
    static post = class POST_LOOP extends LOOP {
        constructor(callback) {
            super("post", callback);
        }
    };
    
    constructor(...args) {
        this.id = counter++;
        
        let [type, callback] = args;
        if(typeof type != "string") {
            callback = type;
            type = "loop";
        }

        if(!["pre", "loop", "post"].includes(type))
            throw Error(`Unrecognized LOOP type: "${type}", type must either be "pre", "loop" or "post"`);
        if(typeof callback != "function")
            throw Error(`Callback is not a function`);

        this.type = type;
        this.callback = callback;
        LOOP.loops[this.type].push(this);

        this.disabled = false;

        this.frame = 0;

        this.dependants = [];

        const thisLoop = this;
        this.loopBefore = class LOOP_BEFORE extends LOOP {
            constructor(callback) {
                super(thisLoop.type, callback);

                this.depends = thisLoop;
                thisLoop.dependants.push(this);

                this.moveToIndex(thisLoop.getIndex() - 1);
            }
        };
        this.loopAfter = class LOOP_AFTER extends LOOP {
            constructor(callback) {
                super(thisLoop.type, callback);

                this.depends = thisLoop;
                thisLoop.dependants.push(this);

                this.moveToIndex(thisLoop.getIndex() + 1);
            }
        };
    }

    disable() {
        this.disabled = true;
    }

    enable() {
        this.disabled = false;
    }

    getIndex() {
        return LOOP.loops[this.type].indexOf(this);
    }
    moveToIndex(index) {
        const list = LOOP.loops[this.type];
        
        list.splice(this.getIndex(), 1);        
        list.splice(index, 0, this);
    }

    update(c) {
        if(!this.disabled)
            this.callback(c, this);

        this.frame++;
    }
    destroy() {
        LOOP.loops.splice(this.getIndex(), 1);
    }
}
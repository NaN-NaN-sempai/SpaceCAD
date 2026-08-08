/* 
USAGE:

// for a loop based implementation:

const mouseLock = new MouseLock(myDOMElement);

const myLoop = () => {
    // do stuff

    mouseLock.update();
}

// it will automaticaly unlock if no request is made during the loop


//  for a non-loop based implementation:

const mouseLock = new MouseLock(myDOMElement);

mouseLock.DOMLock();
mouseLock.DOMUnlock();
*/

class MouseLock {
    constructor(DOMObject) {
        if (typeof window == 'undefined')
            throw new Error('"MouseLock" is not supported outside of the browser.');

        this.element = DOMObject;
        this.state = false;
        
        this.requestLock = false;
        this.pending = false;
        document.addEventListener("pointerlockchange", () => {
            this.pending = false;
            this.state = document.pointerLockElement == this.element;
        });
    }

    ExecuteDOM(promise) {
        this.pending = true;
        Promise.resolve(promise())
            .catch(() => {
                this.pending = false;
            });
    }

    DOMLock() {        
        this.ExecuteDOM(() => this.element.requestPointerLock());
    }

    DOMUnlock() {
        this.ExecuteDOM(() => document.exitPointerLock());
    }


    lock() {
        this.requestLock = true;
    }

    update() {        
        if(this.pending) return;

        if(this.requestLock && !this.state)
            this.DOMLock();
        
        else if(!this.requestLock && this.state)
            this.DOMUnlock();

        this.requestLock = false;
    }
}
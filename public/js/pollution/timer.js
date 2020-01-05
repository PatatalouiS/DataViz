
'use strict';

// ------------------------------- TIMER CLASS -------------------------------------------//

export default class Timer {

    constructor () {
        this.time = null;
    }

    setTimeout (callback, delay) {
        this.time = setTimeout(callback, delay);
    }

    clearTimeout () {
        this.time = clearTimeout(this.time)
        this.time = null;
    }

    setInterval (callback, delay) {
        this.time = setInterval(callback, delay);
    }

    clearInterval () {
        this.time = clearInterval(this.time);
        this.time = null;
    }

    getTime () {
        return this.time
    }
}

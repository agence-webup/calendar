"use strict";

class EventDispatcher {

    constructor(events) {
        this.events = events;
    }

    updateEvents() {
        console.log(this.events);

        this.events.forEach((elem) => {
            let id = elem.date.getTime() + '#' + elem.column;
            let cell = document.querySelector('[data-id="' + id + '"]');
            console.log(cell);
            cell.innerHTML = elem.title;
        });
    }


}

module.exports = EventDispatcher;

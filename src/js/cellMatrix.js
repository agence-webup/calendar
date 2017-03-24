"use strict";

class CellMatrix {

    constructor(days, nbColumns, hours, slotDuration) {
        this.days = days;
        this.nbColumns = nbColumns;
        this.hours = hours;
        this.slotDuration = slotDuration;
        this.matrix = [];

    }

    loadEvents(events) {
        this.events = events;
        this.resetMatrix();
        this.eventsToMatix();
    }

    resetMatrix() {
        let nbColumns = this.days.length * this.nbColumns;
        for(let i = 1; i <= nbColumns; i++) {
            this.matrix[i] = [];
            this.hours.forEach((el, j) => {
                this.matrix[i][j + 1] = 0;
            });
        }
    }

    eventsToMatix() {
        this.events.forEach((el) => {
            let slotsToTake = Math.floor(el.duration / this.slotDuration);


        });

    }


}

module.exports = CellMatrix;

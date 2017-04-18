"use strict";

class LockedEventDispatcher {

    constructor(lockedEvents, slotDuration) {
        this.lockedEvents = lockedEvents;
        this.slotDuration = slotDuration;
    }

    updateEvents() {
        this.lockedEvents.forEach((lockedEvent) => {

            let id = lockedEvent.start.getTime() + '#' + lockedEvent.column;

            // TODO: use caching
            let cell = document.querySelector('[data-id="' + id + '"]');

            if(!cell) {
                return;
            }

            let duration = (lockedEvent.end.getTime() - lockedEvent.start.getTime()) / 60 / 1000;
            let slotsToTake = Math.floor(duration / this.slotDuration);


            if(slotsToTake > 1) {
                // get coordinate
                let cellAdress = cell.dataset.coordinate.split('#');
                // iterate over next cell
                let currentRow = cellAdress[0];
                for(let i = 0; i < slotsToTake; i++) {
                    // TODO: use caching
                    let currentCell = document.querySelector('[data-coordinate="' + currentRow + '#' + cellAdress[1] + '"]');
                    currentCell.classList.add('calendar-locked');
                    currentCell.dataset.locked = '';
                    currentRow++;

                }
            }
        });
    }


}

module.exports = LockedEventDispatcher;

"use strict";

class EventDispatcher {

    constructor(events, slotDuration) {
        this.events = events;
        this.slotDuration = slotDuration;
    }

    updateEvents() {
        //console.log(this.events);

        this.events.forEach((event) => {
            let id = event.date.getTime() + '#' + event.column;

            // TODO: use caching
            let cell = document.querySelector('[data-id="' + id + '"]');

            if(!cell) {
                return;
            }

            // calulcate rowspan
            let slotsToTake = Math.floor(event.duration / this.slotDuration);
            if(slotsToTake > 1) {
                // get coordinate
                let cellAdress = cell.dataset.coordinate.split('#');
                // iterate over next cell
                let currentRow = cellAdress[0];
                for(let i = 1; i < slotsToTake; i++) {
                    currentRow++;

                    // TODO: use caching
                    let currentCell = document.querySelector('[data-coordinate="' + currentRow + '#' + cellAdress[1] + '"]');
                    currentCell.style['background-color'] = 'red';
                    currentCell.style.display = 'none';
                }
            }
            cell.rowSpan = slotsToTake;
            cell.innerHTML = event.title;
        });
    }


}

module.exports = EventDispatcher;

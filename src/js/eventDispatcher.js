"use strict";

class EventDispatcher {

    constructor(slotDuration) {
        this.slotDuration = slotDuration;
    }

    loadEvents(events) {

        this.events = events;

        this.events.forEach((event) => {
            this.addEvent(event);
        });

    }

    addEvent(event) {
        let id = event.date.getTime() + '#' + event.column;

        // TODO: use caching
        let cell = document.querySelector('[data-id="' + id + '"]');

        if(!cell) {
            return;
        }

        cell.dataset.type = 'event';
        cell.dataset.eventId = event.id;
        cell.classList.add('calendar-event');
        cell.classList.remove('calendar-locked');

        // calulcate rowspan
        let slotsToTake = Math.floor(event.duration / this.slotDuration);

        if(slotsToTake >= 1) {
            // get coordinate
            let cellAdress = cell.dataset.coordinate.split('#');
            // iterate over next cell
            let currentRow = cellAdress[0];
            for(let i = 1; i < slotsToTake; i++) {
                currentRow++;

                // TODO: use caching
                let currentCell = document.querySelector('[data-coordinate="' + currentRow + '#' + cellAdress[1] + '"]');
                //currentCell.style['background-color'] = 'red';
                if(currentCell) {
                    currentCell.dataset.originId = event.id;
                    currentCell.style.display = 'none';
                }
            }
        }
        cell.rowSpan = slotsToTake;
        cell.innerHTML = event.title;

        return cell;
    }

}

module.exports = EventDispatcher;

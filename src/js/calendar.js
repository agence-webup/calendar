"use strict";

let DateManager = require('./dateManager'),
UIManager = require('./ui'),
CellMatrix = require('./cellMatrix'),
EventDispatcher = require('./eventDispatcher'),
LockedEventDispatcher = require('./lockedEventDispatcher');

class Calendar {

    constructor(target, options) {
        this.target = document.querySelector(target);

        this.options = options;

        this.events = [
            {
                id: 1,
                title: 'Event 1',
                date: new Date(2017, 2, 28, 10, 0, 0, 0),
                column: 2,
                duration: 80
            },
            {
                id: 2,
                title: 'Event 2',
                date: new Date(2017, 2, 27, 9, 0, 0, 0),
                column: 1,
                duration: 40
            },
            {
                id: 3,
                title: 'Event 3',
                date: new Date(2017, 2, 28, 14, 0, 0, 0),
                column: 3,
                duration: 40
            },
            {
                id: 4,
                title: 'Event 4',
                date: new Date(2017, 2, 27, 10, 0, 0, 0),
                column: 2,
                duration: 100
            },
            {
                id: 5,
                title: 'Event 5',
                date: new Date(2017, 3, 19, 10, 0, 0, 0),
                column: 2,
                duration: 60
            },
        ];

        this.blockedEvent = [
            {
                start: new Date(2017, 3, 19, 12, 0, 0, 0),
                end: new Date(2017, 3, 19, 14, 0, 0, 0),
                column: 2,
                color: 'red'
            },
            {
                start: new Date(2017, 3, 18, 12, 0, 0, 0),
                end: new Date(2017, 3, 18, 18, 0, 0, 0),
                column: 2,
                color: 'red'
            }
        ]

        // handle date (build days and hours arrays)
        let dateManager = new DateManager(this.options.currentDay);
        dateManager.generateDays(this.options.numberOfDays);
        dateManager.generateHours(this.options.dayStartHour, this.options.dayEndHour, this.options.slotDuration);

        // build ui and add ID to cell
        let uiManager = new UIManager(this.target, this.options, this.events, dateManager);
        uiManager.build();

        // cell matrix
        let cellMatrix = new CellMatrix(dateManager.days, this.options.columnsPerDay, dateManager.hours, this.options.slotDuration);
        cellMatrix.loadEvents(this.events);

        // event dispatcher
        let eventDispatcher = new EventDispatcher(this.events, this.options.slotDuration);
        eventDispatcher.updateEvents();

        // lockedEvent dispatcher
        let lockedEventDispatcher = new LockedEventDispatcher(this.blockedEvent, this.options.slotDuration);
        lockedEventDispatcher.updateEvents();

    }


    startEditMode(taskId) {

    }

    stopEditMode() {

    }

    addEventMode(duration, callback) {
        let dropAllowed = true;
        let slotsToTake = Math.floor(duration / this.options.slotDuration);

        if(!slotsToTake >= 1) {
            return;
        }

        [].forEach.call(document.querySelectorAll('[data-id]'), function(el) {

            el.addEventListener('click', (event) => {
                let id = event.target.dataset.id.split('#');
                if(!dropAllowed) {
                    alert('Cet emplacement est déjà prit');
                    event.stopPropagation();
                } else {
                    callback(id[0], id[1]);
                    event.stopPropagation();
                }
            });

            el.addEventListener('mouseover', (event) => {

                [].forEach.call(document.querySelectorAll('[data-id]'), function(cell) {
                    cell.classList.remove('calendar-selection--allowed');
                    cell.classList.remove('calendar-selection--forbidden');
                });

                let cellAdress = event.target.dataset.coordinate.split('#');
                let currentRow = cellAdress[0];
                let cells = [];

                let cssClass = 'calendar-selection--allowed';
                for(let i = 0; i < slotsToTake; i++) {
                    let currentCell = document.querySelector('[data-coordinate="' + currentRow + '#' + cellAdress[1] + '"]');
                    cells.push(currentCell);
                    if(currentCell.dataset.locked !== undefined) {
                        cssClass = 'calendar-selection--forbidden';
                        dropAllowed = false;
                    } else {
                        dropAllowed = true;
                    }
                    currentRow++;
                }

                cells.forEach((cell) => {
                    cell.classList.add(cssClass);
                })
            })
        })
    }


}

module.exports = Calendar;

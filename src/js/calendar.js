"use strict";

let DateManager = require('./dateManager'),
UIManager = require('./ui'),
CellMatrix = require('./cellMatrix'),
EventDispatcher = require('./eventDispatcher');

class Calendar {

    constructor(target, options) {
        this.target = document.querySelector(target);

        this.options = options;

        this.events = [
            {
                id: 1,
                title: 'Event 1',
                date: new Date(2017, 2, 24, 10, 0, 0, 0),
                column: 2,
                duration: 80
            },
            {
                id: 2,
                title: 'Event 2',
                date: new Date(2017, 2, 24, 9, 0, 0, 0),
                column: 1,
                duration: 40
            },
            {
                id: 3,
                title: 'Event 3',
                date: new Date(2017, 2, 25, 14, 0, 0, 0),
                column: 3,
                duration: 40
            },
            {
                id: 4,
                title: 'Event 4',
                date: new Date(2017, 2, 25, 10, 0, 0, 0),
                column: 1,
                duration: 100
            },
            {
                id: 5,
                title: 'Event 5',
                date: new Date(2017, 2, 25, 10, 0, 0, 0),
                column: 3,
                duration: 60
            },
        ];

        // handle date (build days and hours arrays)
        let dateManager = new DateManager(this.options.currentDay);
        dateManager.generateDays(this.options.numberOfDays);
        dateManager.generateHours(this.options.dayStartHour, this.options.dayEndHour, this.options.slotDuration);
        console.log(dateManager.days);

        // build ui and add ID to cell
        let uiManager = new UIManager(this.target, this.options, this.events, dateManager);
        uiManager.build();

        // cell matrix
        let cellMatrix = new CellMatrix(dateManager.days, this.options.columnsPerDay, dateManager.hours, this.options.slotDuration);
        cellMatrix.loadEvents(this.events);

        // event dispatcher
        let eventDispatcher = new EventDispatcher(this.events, this.options.slotDuration);
        eventDispatcher.updateEvents();
    }


    startEditMode(taskId) {

    }

    stopEditMode() {

    }



}

module.exports = Calendar;

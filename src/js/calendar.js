"use strict";

let DateManager = require('./dateManager.js');
let UI = require('./ui.js');

class Calendar {

    constructor(target, options) {

        this.options = {
            currentDay: new Date(),
            numberOfDays: 3,
            columnsPerDay: 3,
            dayStartHour: '08:00',
            dayEndHour: '18:00',
            slotDuration: 20,
            showBulkActions: true,
            cssClass: 'calendar'
        }

        this.events = [
            {
                id: 1,
                title: 'Event 1',
                date: new Date(2017, 3, 20, 7, 0, 0),
                column: 2,
                duration: 40
            }
        ];

        // handle date
        let dateManager = new DateManager(this.options.currentDay);
        dateManager.generateDays(this.options.numberOfDays);
        dateManager.generateHours(this.options.dayStartHour, this.options.dayEndHour, this.options.slotDuration);

        // events matrix

        // build ui
        let ui = new UI(target, this.options, this.events, dateManager);
        ui.build();
    }


    startEditMode(taskId) {

    }

    stopEditMode() {

    }



}

module.exports = Calendar;

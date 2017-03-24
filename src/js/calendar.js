"use strict";

let DateManager = require('./dateManager.js'),
UIManager = require('./ui.js'),
EventDispatcher = require('./eventDispatcher');

class Calendar {

    constructor(target, options) {
        this.target = document.querySelector(target);

        this.options = {
            currentDay: new Date(),
            numberOfDays: 2,
            columnsPerDay: 3,
            dayStartHour: '08:00',
            dayEndHour: '18:00',
            slotDuration: 20,
            showBulkActions: true,
            cssClass: 'calendar',
            onEventClick: function(eventId) {
                console.log('event clicked');
            },
        }

        this.events = [
            {
                id: 1,
                title: 'Event 1',
                date: new Date(2017, 2, 24, 10, 0, 0, 0),
                column: 2,
                duration: 40
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
                title: 'Event 2',
                date: new Date(2017, 2, 25, 10, 0, 0, 0),
                column: 3,
                duration: 40
            },
            {
                id: 4,
                title: 'Event 4',
                date: new Date(2017, 2, 25, 10, 0, 0, 0),
                column: 1,
                duration: 40
            },
        ];

        // handle date
        let dateManager = new DateManager(this.options.currentDay);
        dateManager.generateDays(this.options.numberOfDays);
        dateManager.generateHours(this.options.dayStartHour, this.options.dayEndHour, this.options.slotDuration);

        // build ui
        let uiManager = new UIManager(this.target, this.options, this.events, dateManager);
        uiManager.build();

        // matrix

        // event dispatcher
        let eventDispatcher = new EventDispatcher(this.events);
        eventDispatcher.updateEvents();
    }


    startEditMode(taskId) {

    }

    stopEditMode() {

    }



}

module.exports = Calendar;

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Calendar = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DateManager = require('./dateManager.js'),
    UIManager = require('./ui.js'),
    EventDispatcher = require('./eventDispatcher');

var Calendar = function () {
    function Calendar(target, options) {
        _classCallCheck(this, Calendar);

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
            onEventClick: function onEventClick(eventId) {
                console.log('event clicked');
            }
        };

        this.events = [{
            id: 1,
            title: 'Event 1',
            date: new Date(2017, 2, 24, 10, 0, 0, 0),
            column: 2,
            duration: 40
        }, {
            id: 2,
            title: 'Event 2',
            date: new Date(2017, 2, 24, 9, 0, 0, 0),
            column: 1,
            duration: 40
        }, {
            id: 3,
            title: 'Event 2',
            date: new Date(2017, 2, 25, 10, 0, 0, 0),
            column: 3,
            duration: 40
        }, {
            id: 4,
            title: 'Event 4',
            date: new Date(2017, 2, 25, 10, 0, 0, 0),
            column: 1,
            duration: 40
        }];

        // handle date
        var dateManager = new DateManager(this.options.currentDay);
        dateManager.generateDays(this.options.numberOfDays);
        dateManager.generateHours(this.options.dayStartHour, this.options.dayEndHour, this.options.slotDuration);

        // build ui
        var uiManager = new UIManager(this.target, this.options, this.events, dateManager);
        uiManager.build();

        // matrix

        // event dispatcher
        var eventDispatcher = new EventDispatcher(this.events);
        eventDispatcher.updateEvents();
    }

    _createClass(Calendar, [{
        key: 'startEditMode',
        value: function startEditMode(taskId) {}
    }, {
        key: 'stopEditMode',
        value: function stopEditMode() {}
    }]);

    return Calendar;
}();

module.exports = Calendar;

},{"./dateManager.js":2,"./eventDispatcher":3,"./ui.js":4}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DateManager = function () {
    function DateManager(startDate) {
        _classCallCheck(this, DateManager);

        this.startDate = startDate;

        this.startDate.setHours(0);
        this.startDate.setMinutes(0);
        this.startDate.setSeconds(0);
        this.startDate.setMilliseconds(0);

        this.days = [];
        this.hours = [];
    }

    _createClass(DateManager, [{
        key: 'generateDays',
        value: function generateDays(number) {
            // push first day
            var currentDate = this.startDate;
            this.days.push(currentDate);

            // then calculate other
            for (var i = 0; i < number; i++) {
                currentDate = this.addToDate(currentDate, 1, 0, 0, 0);
                this.days.push(currentDate);
            }
        }
    }, {
        key: 'generateHours',
        value: function generateHours(start, end, slotDuration) {

            // parse start time and cast string to int
            var startTime = start.split(':').map(function (item) {
                return parseInt(item);
            });

            // parse end time and cast string to int
            var endTime = end.split(':').map(function (item) {
                return parseInt(item);
            });

            // use a date object to calculate minutes and hours (exact date is not important)
            var startDateObject = new Date();
            startDateObject.setHours(startTime[0]);
            startDateObject.setMinutes(startTime[1]);
            startDateObject.setSeconds(0);
            startDateObject.setMilliseconds(0);

            // TODO: handle day change
            var endDateObject = new Date();
            endDateObject.setHours(endTime[0]);
            endDateObject.setMinutes(endTime[1]);
            endDateObject.setSeconds(0);
            endDateObject.setMilliseconds(0);

            //console.log(startDateObject);
            //console.log(endDateObject);

            var currentDateObject = startDateObject;

            // push first occurence
            this.hours.push(currentDateObject);

            while (currentDateObject.getTime() < endDateObject.getTime()) {
                //console.log(currentDateObject);
                currentDateObject = this.addToDate(currentDateObject, 0, 0, slotDuration, 0);
                this.hours.push(currentDateObject);
            }
        }
    }, {
        key: '_addTime',
        value: function _addTime(time, slotDuration) {}
    }, {
        key: 'getDayLabel',
        value: function getDayLabel(index) {
            return this.days[index - 1].toLocaleDateString();
        }
    }, {
        key: 'getHoursLabel',
        value: function getHoursLabel(index) {
            return this.formatLeadingZero(this.hours[index].getHours()) + ':' + this.formatLeadingZero(this.hours[index].getMinutes());
        }
    }, {
        key: 'formatLeadingZero',
        value: function formatLeadingZero(value) {
            return ('0' + value).slice(-2);
        }
    }, {
        key: 'addToDate',
        value: function addToDate(date) {
            var days = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var hours = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
            var minutes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
            var seconds = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;

            var returnDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, date.getHours() + hours, date.getMinutes() + minutes, date.getSeconds() + seconds, 0);

            return returnDate;
        }
    }]);

    return DateManager;
}();

module.exports = DateManager;

},{}],3:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventDispatcher = function () {
    function EventDispatcher(events) {
        _classCallCheck(this, EventDispatcher);

        this.events = events;
    }

    _createClass(EventDispatcher, [{
        key: 'updateEvents',
        value: function updateEvents() {
            console.log(this.events);

            this.events.forEach(function (elem) {
                var id = elem.date.getTime() + '#' + elem.column;
                var cell = document.querySelector('[data-id="' + id + '"]');
                console.log(cell);
                cell.innerHTML = elem.title;
            });
        }
    }]);

    return EventDispatcher;
}();

module.exports = EventDispatcher;

},{}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UIManager = function () {
    function UIManager(target, options, events, dateManager) {
        _classCallCheck(this, UIManager);

        this.target = target;
        this.options = options;
        this.events = events;
        this.dateManager = dateManager;
    }

    _createClass(UIManager, [{
        key: 'build',
        value: function build() {
            var table = this._buildTable();
            var dayLabels = this._buildDayLabel();
            var header = this._buildHeader();
            var body = this._buildDays();

            header.appendChild(dayLabels);

            if (this.options.showBulkActions) {
                var bulkActions = this._buildBulkActions();
                header.appendChild(bulkActions);
            }

            table.appendChild(header);
            table.appendChild(body);

            this.target.appendChild(table);
        }
    }, {
        key: '_buildTable',
        value: function _buildTable() {
            var table = document.createElement('table');
            table.classList.add(this.options.cssClass);
            return table;
        }
    }, {
        key: '_buildHeader',
        value: function _buildHeader() {
            return document.createElement('thead');
        }
    }, {
        key: '_buildDayLabel',
        value: function _buildDayLabel() {
            var daysLine = document.createElement('tr');

            var firstIteration = true;
            for (var i = 0; i <= this.options.numberOfDays; i++) {
                var th = document.createElement('th');
                if (firstIteration) {
                    firstIteration = false;
                    th.innerHTML = 'Heure';
                } else {
                    th.innerHTML = this.dateManager.getDayLabel(i);
                    th.colSpan = this.options.columnsPerDay;
                }
                daysLine.appendChild(th);
            }

            return daysLine;
        }
    }, {
        key: '_buildBulkActions',
        value: function _buildBulkActions() {

            var bulkActionsLine = document.createElement('tr');

            var firstIteration = true;

            for (var i = 0; i <= this.options.columnsPerDay * this.options.numberOfDays; i++) {
                var th = document.createElement('th');

                if (firstIteration) {
                    firstIteration = false;
                    th.innerHTML = '';
                } else {
                    th.innerHTML = 'bloquer';
                }

                bulkActionsLine.appendChild(th);
            }

            return bulkActionsLine;
        }
    }, {
        key: '_buildDays',
        value: function _buildDays() {
            var _this = this;

            var numberOfcol = this.options.columnsPerDay * this.options.numberOfDays + 1;
            var tbody = document.createElement('tbody');

            this.dateManager.hours.forEach(function (el, index) {
                var line = document.createElement('tr');

                var firstIteration = true;
                for (var j = 1; j <= numberOfcol; j++) {
                    var td = document.createElement('td');

                    // hours label
                    if (firstIteration) {
                        td.innerHTML = _this.dateManager.getHoursLabel(index);
                        firstIteration = false;
                    } else {
                        td.dataset.id = _this.getCellId(index, j - 1);
                        //td.innerHTML = this.getCellId(index, j - 1);
                        //td.innerHTML = this.dateManager.hours[index];
                    }

                    line.appendChild(td);
                }

                tbody.appendChild(line);
            });

            return tbody;
        }
    }, {
        key: 'getCellId',
        value: function getCellId(index, column) {
            var day = Math.ceil(column / this.options.columnsPerDay);
            console.log(this.dateManager.days[day - 1]);

            var date = this.dateManager.days[day - 1];
            date.setHours(this.dateManager.hours[index].getHours());
            date.setMinutes(this.dateManager.hours[index].getMinutes());
            date.setSeconds(0);
            date.setMilliseconds(0);

            var col = column % this.options.columnsPerDay == 0 ? this.options.columnsPerDay : column % this.options.columnsPerDay;
            return date.getTime() + '#' + col;
        }
    }]);

    return UIManager;
}();

module.exports = UIManager;

},{}]},{},[1])(1)
});
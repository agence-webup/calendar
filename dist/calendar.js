(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Calendar = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DateManager = require('./dateManager'),
    UIManager = require('./ui'),
    CellMatrix = require('./cellMatrix'),
    EventDispatcher = require('./eventDispatcher'),
    LockedEventDispatcher = require('./lockedEventDispatcher');

var Calendar = function () {
    function Calendar(target, options) {
        _classCallCheck(this, Calendar);

        this.target = document.querySelector(target);

        this.options = options;

        this.events = [{
            id: 1,
            title: 'Event 1',
            date: new Date(2017, 2, 28, 10, 0, 0, 0),
            column: 2,
            duration: 80
        }, {
            id: 2,
            title: 'Event 2',
            date: new Date(2017, 2, 27, 9, 0, 0, 0),
            column: 1,
            duration: 40
        }, {
            id: 3,
            title: 'Event 3',
            date: new Date(2017, 2, 28, 14, 0, 0, 0),
            column: 3,
            duration: 40
        }, {
            id: 4,
            title: 'Event 4',
            date: new Date(2017, 2, 27, 10, 0, 0, 0),
            column: 2,
            duration: 100
        }, {
            id: 5,
            title: 'Event 5',
            date: new Date(2017, 3, 19, 10, 0, 0, 0),
            column: 2,
            duration: 60
        }];

        this.blockedEvent = [{
            start: new Date(2017, 3, 19, 12, 0, 0, 0),
            end: new Date(2017, 3, 19, 14, 0, 0, 0),
            column: 2,
            color: 'red'
        }, {
            start: new Date(2017, 3, 18, 12, 0, 0, 0),
            end: new Date(2017, 3, 18, 18, 0, 0, 0),
            column: 2,
            color: 'red'
        }];

        // handle date (build days and hours arrays)
        var dateManager = new DateManager(this.options.currentDay);
        dateManager.generateDays(this.options.numberOfDays);
        dateManager.generateHours(this.options.dayStartHour, this.options.dayEndHour, this.options.slotDuration);

        // build ui and add ID to cell
        var uiManager = new UIManager(this.target, this.options, this.events, dateManager);
        uiManager.build();

        // cell matrix
        var cellMatrix = new CellMatrix(dateManager.days, this.options.columnsPerDay, dateManager.hours, this.options.slotDuration);
        cellMatrix.loadEvents(this.events);

        // event dispatcher
        var eventDispatcher = new EventDispatcher(this.events, this.options.slotDuration);
        eventDispatcher.updateEvents();

        // lockedEvent dispatcher
        var lockedEventDispatcher = new LockedEventDispatcher(this.blockedEvent, this.options.slotDuration);
        lockedEventDispatcher.updateEvents();
    }

    _createClass(Calendar, [{
        key: 'startEditMode',
        value: function startEditMode(taskId) {}
    }, {
        key: 'stopEditMode',
        value: function stopEditMode() {}
    }, {
        key: 'addEventMode',
        value: function addEventMode(duration, callback) {
            var dropAllowed = true;
            var slotsToTake = Math.floor(duration / this.options.slotDuration);

            if (!slotsToTake >= 1) {
                return;
            }

            [].forEach.call(document.querySelectorAll('[data-id]'), function (el) {

                el.addEventListener('click', function (event) {
                    var id = event.target.dataset.id.split('#');
                    if (!dropAllowed) {
                        alert('Cet emplacement est déjà prit');
                        event.stopPropagation();
                    } else {
                        callback(id[0], id[1]);
                        event.stopPropagation();
                    }
                });

                el.addEventListener('mouseover', function (event) {

                    [].forEach.call(document.querySelectorAll('[data-id]'), function (cell) {
                        cell.classList.remove('calendar-selection--allowed');
                        cell.classList.remove('calendar-selection--forbidden');
                    });

                    var cellAdress = event.target.dataset.coordinate.split('#');
                    var currentRow = cellAdress[0];
                    var cells = [];

                    var cssClass = 'calendar-selection--allowed';
                    for (var i = 0; i < slotsToTake; i++) {
                        var currentCell = document.querySelector('[data-coordinate="' + currentRow + '#' + cellAdress[1] + '"]');
                        cells.push(currentCell);
                        if (currentCell.dataset.locked !== undefined) {
                            cssClass = 'calendar-selection--forbidden';
                            dropAllowed = false;
                        } else {
                            dropAllowed = true;
                        }
                        currentRow++;
                    }

                    cells.forEach(function (cell) {
                        cell.classList.add(cssClass);
                    });
                });
            });
        }
    }]);

    return Calendar;
}();

module.exports = Calendar;

},{"./cellMatrix":2,"./dateManager":3,"./eventDispatcher":4,"./lockedEventDispatcher":5,"./ui":6}],2:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CellMatrix = function () {
    function CellMatrix(days, nbColumns, hours, slotDuration) {
        _classCallCheck(this, CellMatrix);

        this.days = days;
        this.nbColumns = nbColumns;
        this.hours = hours;
        this.slotDuration = slotDuration;
        this.matrix = [];
    }

    _createClass(CellMatrix, [{
        key: "loadEvents",
        value: function loadEvents(events) {
            this.events = events;
            this.resetMatrix();
            this.eventsToMatix();
        }
    }, {
        key: "resetMatrix",
        value: function resetMatrix() {
            var _this = this;

            var nbColumns = this.days.length * this.nbColumns;

            var _loop = function _loop(i) {
                _this.matrix[i] = [];
                _this.hours.forEach(function (el, j) {
                    _this.matrix[i][j + 1] = 0;
                });
            };

            for (var i = 1; i <= nbColumns; i++) {
                _loop(i);
            }
        }
    }, {
        key: "eventsToMatix",
        value: function eventsToMatix() {
            var _this2 = this;

            this.events.forEach(function (el) {
                var slotsToTake = Math.floor(el.duration / _this2.slotDuration);
            });
        }
    }]);

    return CellMatrix;
}();

module.exports = CellMatrix;

},{}],3:[function(require,module,exports){
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
            for (var i = 1; i < number; i++) {
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

},{}],4:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventDispatcher = function () {
    function EventDispatcher(events, slotDuration) {
        _classCallCheck(this, EventDispatcher);

        this.events = events;
        this.slotDuration = slotDuration;
    }

    _createClass(EventDispatcher, [{
        key: 'updateEvents',
        value: function updateEvents() {
            var _this = this;

            //console.log(this.events);

            this.events.forEach(function (event) {
                var id = event.date.getTime() + '#' + event.column;

                // TODO: use caching
                var cell = document.querySelector('[data-id="' + id + '"]');

                if (!cell) {
                    return;
                }

                // calulcate rowspan
                var slotsToTake = Math.floor(event.duration / _this.slotDuration);
                if (slotsToTake > 1) {
                    // get coordinate
                    var cellAdress = cell.dataset.coordinate.split('#');
                    // iterate over next cell
                    var currentRow = cellAdress[0];
                    for (var i = 1; i < slotsToTake; i++) {
                        currentRow++;

                        // TODO: use caching
                        var currentCell = document.querySelector('[data-coordinate="' + currentRow + '#' + cellAdress[1] + '"]');
                        currentCell.style['background-color'] = 'red';
                        currentCell.style.display = 'none';
                    }
                }
                cell.rowSpan = slotsToTake;
                cell.innerHTML = event.title;
            });
        }
    }]);

    return EventDispatcher;
}();

module.exports = EventDispatcher;

},{}],5:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LockedEventDispatcher = function () {
    function LockedEventDispatcher(lockedEvents, slotDuration) {
        _classCallCheck(this, LockedEventDispatcher);

        this.lockedEvents = lockedEvents;
        this.slotDuration = slotDuration;
    }

    _createClass(LockedEventDispatcher, [{
        key: 'updateEvents',
        value: function updateEvents() {
            var _this = this;

            this.lockedEvents.forEach(function (lockedEvent) {

                var id = lockedEvent.start.getTime() + '#' + lockedEvent.column;

                // TODO: use caching
                var cell = document.querySelector('[data-id="' + id + '"]');

                if (!cell) {
                    return;
                }

                var duration = (lockedEvent.end.getTime() - lockedEvent.start.getTime()) / 60 / 1000;
                var slotsToTake = Math.floor(duration / _this.slotDuration);

                if (slotsToTake > 1) {
                    // get coordinate
                    var cellAdress = cell.dataset.coordinate.split('#');
                    // iterate over next cell
                    var currentRow = cellAdress[0];
                    for (var i = 0; i < slotsToTake; i++) {
                        // TODO: use caching
                        var currentCell = document.querySelector('[data-coordinate="' + currentRow + '#' + cellAdress[1] + '"]');
                        currentCell.classList.add('calendar-locked');
                        currentCell.dataset.locked = '';
                        currentRow++;
                    }
                }
            });
        }
    }]);

    return LockedEventDispatcher;
}();

module.exports = LockedEventDispatcher;

},{}],6:[function(require,module,exports){
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

            //this.target.removeChild();
            if (this.target.querySelector('table')) {
                this.target.removeChild(this.target.querySelector('table'));
            }

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
                        td.dataset.coordinate = _this.getCellCoordinate(index, j - 1);

                        //td.innerHTML = this.getCellId(index, j - 1);
                        //td.innerHTML = this.dateManager.hours[index];
                        //td.innerHTML = this.getCellCoordinate(index, j - 1);
                    }

                    line.appendChild(td);
                }

                tbody.appendChild(line);
            });

            return tbody;
        }

        /**
         * Get cell id (timestamp#col)
         * @param  {[type]} index  [description]
         * @param  {[type]} column [description]
         * @return [type]          [description]
         */

    }, {
        key: 'getCellId',
        value: function getCellId(index, column) {
            var day = Math.ceil(column / this.options.columnsPerDay);

            var date = this.dateManager.days[day - 1];
            date.setHours(this.dateManager.hours[index].getHours());
            date.setMinutes(this.dateManager.hours[index].getMinutes());
            date.setSeconds(0);
            date.setMilliseconds(0);

            var col = column % this.options.columnsPerDay == 0 ? this.options.columnsPerDay : column % this.options.columnsPerDay;
            return date.getTime() + '#' + col;
        }

        /**
         * Get cell coordinates (row#column)
         * @param  {[type]} index  [description]
         * @param  {[type]} column [description]
         * @return [type]          [description]
         */

    }, {
        key: 'getCellCoordinate',
        value: function getCellCoordinate(index, column) {
            return index + 1 + '#' + column;
        }
    }]);

    return UIManager;
}();

module.exports = UIManager;

},{}]},{},[1])(1)
});
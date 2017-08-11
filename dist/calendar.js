(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Calendar = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DateManager = require('./dateManager');
var UIManager = require('./uiManager');
var EventsManager = require('./eventsManager');
var CellMatrix = require('./cellMatrix');
var EventDispatcher = require('./eventDispatcher');
var LockedEventDispatcher = require('./lockedEventDispatcher');

var ADD_MODE = 'add';
var EDIT_MODE = 'edit';
var WRITE_MODE = 'write';
var VIEW_MODE = 'view';
var LOCKED_MODE = 'locked';

var Calendar = function () {
    function Calendar(target, options) {
        _classCallCheck(this, Calendar);

        this.target = document.querySelector(target);
        this.options = options;

        this.mode = {
            current: VIEW_MODE,
            ADD_MODE: {
                dropAllowed: null,
                slotsToTake: null,
                callback: null
            },
            LOCKED_MODE: {
                mousedown: false,
                start: null,
                end: null,
                stack: [{
                    start: null,
                    end: null,
                    column: null
                }]
            }
        };

        this.init();
        this.build();
    }

    _createClass(Calendar, [{
        key: 'init',
        value: function init() {
            // bind callendar controls
            this._bindControlls();
        }
    }, {
        key: 'build',
        value: function build() {
            // handle date (build days and hours arrays)
            this.dateManager = new DateManager(this.options.currentDay);
            this.dateManager.generateDays(this.options.numberOfDays);
            this.dateManager.generateHours(this.options.dayStartHour, this.options.dayEndHour, this.options.slotDuration);

            // build ui and add ID to cell
            this.uiManager = new UIManager(this.target, this.options, this.events, this.dateManager);
            this.uiManager.build();
        }
    }, {
        key: 'loadEvents',
        value: function loadEvents(events, blockedEvents) {
            this.events = events;
            this.blockedEvents = blockedEvents;

            // event dispatcher
            this.eventDispatcher = new EventDispatcher(this.options.slotDuration);
            this.eventDispatcher.loadEvents(this.events);

            // lockedEvent dispatcher
            this.lockedEventDispatcher = new LockedEventDispatcher(this.options.slotDuration);
            this.lockedEventDispatcher.loadEvents(this.blockedEvents);

            this._bindEvents();
        }
    }, {
        key: 'addEvent',
        value: function addEvent(event) {
            var cell = this.eventDispatcher.addEvent(event);
            this._attachClickEvent(cell);
        }
    }, {
        key: 'removeEvent',
        value: function removeEvent(id) {
            var _this = this;

            var event = document.querySelector('[data-event-id="' + id + '"]');
            [].forEach.call(document.querySelectorAll('[data-origin-id="' + id + '"]'), function (el) {
                el.style.display = 'table-cell';
            });
            event.rowSpan = 1;
            event.classList.remove('calendar-event');
            event.innerHTML = '';
            this.events.forEach(function (el, index) {
                if (el.id === id) {
                    _this.events.splice(index, 1);
                }
            });
        }
    }, {
        key: '_switchMode',
        value: function _switchMode(mode) {
            var _this2 = this;

            switch (mode) {
                case ADD_MODE:
                    this.mode.current = ADD_MODE;
                    this.uiManager.showFooter('Choisissez une plage horaire libre', function () {
                        _this2._switchMode(VIEW_MODE);
                    });
                    break;
                case EDIT_MODE:
                    break;
                case LOCKED_MODE:
                    this.mode.current = LOCKED_MODE;
                    this.target.dataset.mode = LOCKED_MODE;

                    this.uiManager.showFooter('Choisissez les plages horaires à bloquer', function () {
                        _this2.resetMode();
                    });

                    break;
                case VIEW_MODE:
                    this.target.dataset.mode = VIEW_MODE;
                    this.mode.current = VIEW_MODE;

                    // clean add mode
                    [].forEach.call(document.querySelectorAll('[data-id]'), function (cell) {
                        cell.classList.remove('calendar-selection--allowed');
                        cell.classList.remove('calendar-selection--forbidden');
                    });

                    console.log('Entering view mode');
                    break;
                default:

            }
        }
    }, {
        key: 'resetMode',
        value: function resetMode() {
            switch (this.mode.current) {
                case ADD_MODE:
                    this.mode.ADD_MODE = {
                        dropAllowed: null,
                        slotsToTake: null,
                        callback: null
                    };
                    break;
                case LOCKED_MODE:
                    [].forEach.call(document.querySelectorAll('[data-locked-temp]'), function (cell) {
                        cell.classList.remove('calendar-lockedTemp');
                        cell.removeAttribute('data-locked-temp');
                    });
                    break;
            }

            this.uiManager.hideFooter();
            this._switchMode(VIEW_MODE);
        }
    }, {
        key: 'startEditMode',
        value: function startEditMode(id, callback) {
            this.removeEvent(id);

            var event = null;

            this.events.forEach(function (el) {
                if (el.id == id) {
                    event = el;
                }
            });

            if (event) {
                this.startAddEventMode(event.duration, callback);
            }
        }
    }, {
        key: 'startLockedMode',
        value: function startLockedMode() {
            this._switchMode(LOCKED_MODE);
        }
    }, {
        key: 'commitLocked',
        value: function commitLocked(callback) {
            var colNumber = this.options.numberOfDays * this.options.columnsPerDay;
            var lineNumber = this.dateManager.hours.length;
            var samePeriod = false;
            for (var i = 1; i <= colNumber; i++) {
                for (var j = 1; j <= lineNumber; j++) {
                    var currentCell = document.querySelector('[data-coordinate="' + j + '#' + i + '"]');
                    var id = currentCell.dataset.id.split('#');

                    var lastItem = this.mode.LOCKED_MODE.stack[this.mode.LOCKED_MODE.stack.length - 1];

                    if (currentCell.hasAttribute('data-locked-temp') && lastItem.start === null) {
                        lastItem.start = new Date(parseInt(id[0]));

                        // retrieve column based on day
                        var coordinates = currentCell.dataset.coordinate.split('#');
                        lastItem.column = coordinates[1] % this.options.columnsPerDay == 0 ? this.options.columnsPerDay : coordinates[1] % this.options.columnsPerDay;
                    } else if (!currentCell.hasAttribute('data-locked-temp') && lastItem.end === null && lastItem.start !== null) {
                        lastItem.end = new Date(parseInt(id[0]));
                        this.mode.LOCKED_MODE.stack.push({
                            start: null,
                            end: null,
                            column: null
                        });
                    }
                }
            }

            [].forEach.call(document.querySelectorAll('[data-locked-temp]'), function (el) {
                el.classList.add('calendar-locked');
                el.classList.remove('calendar-lockedTemp');
                el.removeAttribute('data-locked-temp');
            });

            // TODO: refactoring
            if (this.mode.LOCKED_MODE.stack[this.mode.LOCKED_MODE.stack.length - 1].start === null) {
                this.mode.LOCKED_MODE.stack.splice(-1, 1);
            }

            callback(this.mode.LOCKED_MODE.stack);

            this.mode.LOCKED_MODE.stack = [{
                start: null,
                end: null,
                column: null
            }];

            this.resetMode();
        }
    }, {
        key: 'startAddEventMode',
        value: function startAddEventMode(duration, callback) {

            // switch to, add mode
            this._switchMode(ADD_MODE);

            this.mode.ADD_MODE.dropAllowed = true;
            this.mode.ADD_MODE.slotsToTake = Math.floor(duration / this.options.slotDuration);
            this.mode.ADD_MODE.callback = callback;

            if (!this.mode.ADD_MODE.slotsToTake >= 1) {
                return;
            }
        }
    }, {
        key: '_attachClickEvent',
        value: function _attachClickEvent(el) {
            var _this3 = this;

            el.addEventListener('click', function (event) {
                event.stopPropagation();
                if (_this3.mode.current == VIEW_MODE) {
                    _this3.options.onEventClicked(event.target.dataset.eventId);
                }
            });
        }
    }, {
        key: '_bindControlls',
        value: function _bindControlls() {
            var _this4 = this;

            this.options.ui.next.addEventListener('click', function () {
                var newDate = DateManager.addToDate(_this4.options.currentDay, _this4.options.numberOfDays);
                _this4.options.currentDay = newDate;
                _this4.build();
                _this4.options.onPeriodChange.bind(_this4)(newDate, DateManager.addToDate(newDate, _this4.options.numberOfDays));
            });

            this.options.ui.prev.addEventListener('click', function () {
                var newDate = DateManager.addToDate(_this4.options.currentDay, -_this4.options.numberOfDays);
                _this4.options.currentDay = newDate;
                _this4.build();
                _this4.options.onPeriodChange.bind(_this4)(newDate, DateManager.addToDate(newDate, _this4.options.numberOfDays));
            });

            this.options.ui.today.addEventListener('click', function () {
                var newDate = new Date();
                _this4.options.currentDay = newDate;
                _this4.build();
                _this4.options.onPeriodChange.bind(_this4)(newDate, DateManager.addToDate(newDate, _this4.options.numberOfDays));
            });
        }
    }, {
        key: '_bindEvents',
        value: function _bindEvents() {
            var _this5 = this;

            [].forEach.call(document.querySelectorAll('[data-type="event"]'), function (el) {
                // click on event
                _this5._attachClickEvent(el);
            });

            [].forEach.call(document.querySelectorAll('[data-id]'), function (el) {

                // click on cell
                el.addEventListener('click', function (event) {
                    event.stopPropagation();

                    switch (_this5.mode.current) {
                        case ADD_MODE:
                            var id = event.target.dataset.id.split('#');
                            if (!_this5.mode.ADD_MODE.dropAllowed) {
                                alert('Cet emplacement est déjà pris');
                            } else {
                                // call back method with date and column
                                var date = new Date(parseInt(id[0]));
                                _this5.mode.ADD_MODE.callback(date, id[1]);
                                _this5.resetMode();
                            }
                            break;
                        default:

                    }
                });

                // mouse down
                el.addEventListener('mousedown', function (event) {
                    if (_this5.mode.current == LOCKED_MODE) {
                        _this5.mode.LOCKED_MODE.start = event.target.dataset.coordinate;
                        _this5.mode.LOCKED_MODE.mousedown = true;
                    }
                });

                // mouse up
                el.addEventListener('mouseup', function (event) {
                    if (_this5.mode.current == LOCKED_MODE) {
                        _this5.mode.LOCKED_MODE.end = event.target.dataset.coordinate;
                        _this5.mode.LOCKED_MODE.mousedown = false;
                    }
                });

                // hovering a cell
                el.addEventListener('mouseover', function (event) {

                    switch (_this5.mode.current) {
                        case ADD_MODE:

                            [].forEach.call(document.querySelectorAll('[data-id]'), function (cell) {
                                cell.classList.remove('calendar-selection--allowed');
                                cell.classList.remove('calendar-selection--forbidden');
                            });

                            var cellAdress = event.target.dataset.coordinate.split('#');
                            var currentRow = cellAdress[0];
                            var cells = [];

                            var cssClass = 'calendar-selection--allowed';
                            var dropAllowed = true;

                            for (var i = 0; i < _this5.mode.ADD_MODE.slotsToTake; i++) {
                                var currentCell = document.querySelector('[data-coordinate="' + currentRow + '#' + cellAdress[1] + '"]');
                                cells.push(currentCell);
                                if (currentCell.dataset.type === 'locked' || currentCell.dataset.type === 'event') {
                                    cssClass = 'calendar-selection--forbidden';
                                    dropAllowed = false;
                                }
                                currentRow++;
                            }

                            if (dropAllowed) {
                                _this5.mode.ADD_MODE.dropAllowed = true;
                            } else {
                                _this5.mode.ADD_MODE.dropAllowed = false;
                            }

                            cells.forEach(function (cell) {
                                cell.classList.add(cssClass);
                            });
                            break;
                        case LOCKED_MODE:
                            if (_this5.mode.LOCKED_MODE.start !== null) {
                                var start = _this5.mode.LOCKED_MODE.start.split('#');
                                var current = event.target.dataset.coordinate.split('#');

                                if (current[1] == start[1] && _this5.mode.LOCKED_MODE.mousedown) {

                                    var startCell = parseInt(start[0]) < parseInt(current[0]) ? parseInt(start[0]) : parseInt(current[0]);
                                    var endCell = parseInt(current[0]) > parseInt(start[0]) ? parseInt(current[0]) : parseInt(start[0]);

                                    for (var _i = startCell; _i <= endCell; _i++) {
                                        var cellToLocked = document.querySelector('[data-coordinate="' + _i + '#' + start[1] + '"]');
                                        if (cellToLocked.dataset.type !== 'event' || cellToLocked.dataset.type !== 'locked') {
                                            cellToLocked.classList.add('calendar-lockedTemp');
                                            cellToLocked.dataset.lockedTemp = '';
                                        }
                                    }
                                }
                            }

                        default:

                    }
                });
            });
        }
    }]);

    return Calendar;
}();

module.exports = Calendar;

},{"./cellMatrix":2,"./dateManager":3,"./eventDispatcher":4,"./eventsManager":5,"./lockedEventDispatcher":6,"./uiManager":7}],2:[function(require,module,exports){
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
                currentDate = this.constructor.addToDate(currentDate, 1, 0, 0, 0);
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
                currentDateObject = this.constructor.addToDate(currentDateObject, 0, 0, slotDuration, 0);
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
    }], [{
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
    function EventDispatcher(slotDuration) {
        _classCallCheck(this, EventDispatcher);

        this.slotDuration = slotDuration;
    }

    _createClass(EventDispatcher, [{
        key: 'loadEvents',
        value: function loadEvents(events) {
            var _this = this;

            this.events = events;

            this.events.forEach(function (event) {
                _this.addEvent(event);
            });
        }
    }, {
        key: 'addEvent',
        value: function addEvent(event) {
            var id = event.date.getTime() + '#' + event.column;

            // TODO: use caching
            var cell = document.querySelector('[data-id="' + id + '"]');

            if (!cell) {
                return;
            }

            cell.dataset.type = 'event';
            cell.dataset.eventId = event.id;
            cell.classList.add('calendar-event');

            // calulcate rowspan
            var slotsToTake = Math.floor(event.duration / this.slotDuration);

            if (slotsToTake >= 1) {
                // get coordinate
                var cellAdress = cell.dataset.coordinate.split('#');
                // iterate over next cell
                var currentRow = cellAdress[0];
                for (var i = 1; i < slotsToTake; i++) {
                    currentRow++;

                    // TODO: use caching
                    var currentCell = document.querySelector('[data-coordinate="' + currentRow + '#' + cellAdress[1] + '"]');
                    //currentCell.style['background-color'] = 'red';
                    currentCell.dataset.originId = event.id;
                    currentCell.style.display = 'none';
                }
            }
            cell.rowSpan = slotsToTake;
            cell.innerHTML = event.title;

            return cell;
        }
    }]);

    return EventDispatcher;
}();

module.exports = EventDispatcher;

},{}],5:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventsManager = function EventsManager() {
    _classCallCheck(this, EventsManager);

    console.log('New event manager');
};

module.exports = EventsManager;

},{}],6:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LockedEventDispatcher = function () {
    function LockedEventDispatcher(slotDuration) {
        _classCallCheck(this, LockedEventDispatcher);

        this.slotDuration = slotDuration;
    }

    _createClass(LockedEventDispatcher, [{
        key: 'loadEvents',
        value: function loadEvents(lockedEvents) {
            var _this = this;

            this.lockedEvents = lockedEvents;

            this.lockedEvents.forEach(function (lockedEvent) {
                _this.addEvent(lockedEvent);
            });
        }
    }, {
        key: 'addEvent',
        value: function addEvent(lockedEvent) {
            var id = lockedEvent.start.getTime() + '#' + lockedEvent.column;

            // TODO: use caching
            var cell = document.querySelector('[data-id="' + id + '"]');

            if (!cell) {
                return;
            }

            var duration = (lockedEvent.end.getTime() - lockedEvent.start.getTime()) / 60 / 1000;
            var slotsToTake = Math.floor(duration / this.slotDuration);

            if (slotsToTake >= 1) {
                // get coordinate
                var cellAdress = cell.dataset.coordinate.split('#');
                // iterate over next cell
                var currentRow = cellAdress[0];
                for (var i = 0; i < slotsToTake; i++) {
                    // TODO: use caching
                    var currentCell = document.querySelector('[data-coordinate="' + currentRow + '#' + cellAdress[1] + '"]');
                    currentCell.classList.add('calendar-locked');
                    currentCell.dataset.type = 'locked';
                    currentRow++;
                }
            }
        }
    }]);

    return LockedEventDispatcher;
}();

module.exports = LockedEventDispatcher;

},{}],7:[function(require,module,exports){
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

        this.ui = {
            footer: this._buildFooter()
        };

        this.listener = {
            footerBtn: null
        };
    }

    _createClass(UIManager, [{
        key: 'build',
        value: function build() {
            var table = this._buildTable();
            var dayLabels = this._buildDayLabel();
            var header = this._buildHeader();
            var body = this._buildDays();
            var footer = this._buildFooter();

            header.appendChild(dayLabels);

            var bulkActions = this._buildBulkActions();
            header.appendChild(bulkActions);

            table.appendChild(header);
            table.appendChild(body);

            //this.target.removeChild();
            if (this.target.querySelector('table')) {
                this.target.removeChild(this.target.querySelector('table'));
            }

            this.target.innerHTML = '';
            this.target.appendChild(table);

            // append footer
            document.body.append(this.ui.footer.wrapper);
        }
    }, {
        key: 'showFooter',
        value: function showFooter(text, callback) {
            var _this = this;

            this.ui.footer.message.innerHTML = text;
            setTimeout(function () {
                _this.ui.footer.wrapper.classList.add('calendar-mode--active');
            }, 10);

            this.ui.footer.btn.addEventListener('click', function (event) {
                callback();
                _this.hideFooter();
            });
        }
    }, {
        key: 'hideFooter',
        value: function hideFooter() {
            this.ui.footer.wrapper.classList.remove('calendar-mode--active');
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
                    th.classList.add('calendar-bulk');
                } else {
                    th.innerHTML = 'bloquer';
                    th.classList.add('calendar-bulk');
                }

                bulkActionsLine.appendChild(th);
            }

            return bulkActionsLine;
        }
    }, {
        key: '_buildDays',
        value: function _buildDays() {
            var _this2 = this;

            var numberOfcol = this.options.columnsPerDay * this.options.numberOfDays + 1;
            var tbody = document.createElement('tbody');

            this.dateManager.hours.forEach(function (el, index) {
                var line = document.createElement('tr');

                var firstIteration = true;
                for (var j = 1; j <= numberOfcol; j++) {
                    var td = document.createElement('td');

                    // hours label
                    if (firstIteration) {
                        td.innerHTML = _this2.dateManager.getHoursLabel(index);
                        firstIteration = false;
                    } else {
                        td.dataset.id = _this2.getCellId(index, j - 1);
                        td.dataset.coordinate = _this2.getCellCoordinate(index, j - 1);

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
    }, {
        key: '_buildFooter',
        value: function _buildFooter(text) {
            var footer = document.createElement('div');
            footer.classList.add('calendar-mode');
            footer.innerHTML = '';

            var message = document.createElement('span');
            message.innerHTML = '';

            var footerBtn = document.createElement('button');
            footerBtn.innerText = 'Annuler';

            footer.appendChild(message);
            footer.appendChild(footerBtn);

            return {
                message: message,
                wrapper: footer,
                btn: footerBtn
            };
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
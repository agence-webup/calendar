"use strict";

const DateManager = require('./dateManager');
const UIManager = require('./uiManager');
const EventsManager = require('./eventsManager');
const CellMatrix = require('./cellMatrix');
const EventDispatcher = require('./eventDispatcher');
const LockedEventDispatcher = require('./lockedEventDispatcher');

const ADD_MODE = 'add';
const EDIT_MODE = 'edit';
const WRITE_MODE = 'write';
const VIEW_MODE = 'view';
const LOCKED_MODE = 'locked';

class Calendar {

    constructor(target, options) {
        this.target = document.querySelector(target);
        this.options = options;

        this.mode = {
            current: VIEW_MODE,
            ADD_MODE: {
                slotsToTake: null,
                dropAllowed: null
            },
            LOCKED_MODE: {
                mousedown: false,
                start: null,
                end: null,
                stack: []
            }
        }

        this.init();
        this.build();
    }

    init() {
        // bind callendar controls
        this._bindControlls();
    }

    build() {
        // handle date (build days and hours arrays)
        let dateManager = new DateManager(this.options.currentDay);
        dateManager.generateDays(this.options.numberOfDays);
        dateManager.generateHours(this.options.dayStartHour, this.options.dayEndHour, this.options.slotDuration);

        // build ui and add ID to cell
        this.uiManager = new UIManager(this.target, this.options, this.events, dateManager);
        this.uiManager.build();
    }

    loadEvents(events, blockedEvents) {
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

    addEvent(event) {
        let cell = this.eventDispatcher.addEvent(event);
        this._attachClickEvent(cell);
    }

    removeEvent(id) {
        console.log('Remove event ' + id);
        let event = document.querySelector('[data-event-id="' + id + '"]');
        [].forEach.call(document.querySelectorAll('[data-origin-id="' + id + '"]'), (el) => {
            el.style.display = 'table-cell';
        });
        event.rowSpan = 1;
        event.classList.remove('calendar-event');
        event.innerHTML = '';
    }

    _switchMode(mode) {
        switch (mode) {
            case ADD_MODE:
            this.mode.current = ADD_MODE;
            console.log('Entering add mode');
            this.uiManager.showFooter('Choisissez une plage horaire libre', () => {
                this._switchMode(VIEW_MODE);
            });
            break;
            case EDIT_MODE:
            console.log('Entering edit mode');
            break;
            case LOCKED_MODE:
            this.mode.current = LOCKED_MODE;
            this.target.dataset.mode = LOCKED_MODE;

            console.log('Entering locked mode');
            this.uiManager.showFooter('Choisissez les plages horaires à bloquer', () => {
                this._switchMode(VIEW_MODE);
            });
            break;
            case VIEW_MODE:
            this.target.dataset.mode = VIEW_MODE;
            this.mode.current = VIEW_MODE;

            // clean add mode
            [].forEach.call(document.querySelectorAll('[data-id]'), function(cell) {
                cell.classList.remove('calendar-selection--allowed');
                cell.classList.remove('calendar-selection--forbidden');
            });

            console.log('Entering view mode');
            break;
            default:

        }

    }

    startEditMode(id, callback) {
        this.removeEvent(id);

        let event = null;

        this.events.forEach((el) => {
            if(el.id == id) {
                event = el;
            }
        });

        if(event) {
            this.startAddEventMode(event.duration, callback);
        }
    }

    startLockedMode() {
        this._switchMode(LOCKED_MODE);
    };

    startAddEventMode(duration, callback) {

        // switch to, add mode
        this._switchMode(ADD_MODE);

        this.mode.ADD_MODE.dropAllowed = true;
        this.mode.ADD_MODE.slotsToTake = Math.floor(duration / this.options.slotDuration);
        this.mode.ADD_MODE.callback = callback;

        if(!this.mode.ADD_MODE.slotsToTake >= 1) {
            return;
        }

    }

    _attachClickEvent(el) {
        el.addEventListener('click', (event) => {
            event.stopPropagation();
            if(this.mode.current == VIEW_MODE) {
                this.options.onEventClicked(event.target.dataset.eventId);
            }
        });
    }

    _bindControlls() {
        this.options.ui.next.addEventListener('click', () => {
            let newDate = DateManager.addToDate(this.options.currentDay, this.options.numberOfDays);
            this.options.currentDay = newDate;
            this.build();
            this.options.onPeriodChange.bind(this)(newDate, DateManager.addToDate(newDate, this.options.numberOfDays));
        });

        this.options.ui.prev.addEventListener('click', () => {
            let newDate = DateManager.addToDate(this.options.currentDay, -this.options.numberOfDays);
            this.options.currentDay = newDate;
            this.build();
            this.options.onPeriodChange.bind(this)(newDate, DateManager.addToDate(newDate, this.options.numberOfDays));
        });

        this.options.ui.today.addEventListener('click', () => {
            let newDate = new Date();
            this.options.currentDay = newDate;
            this.build();
            this.options.onPeriodChange.bind(this)(newDate, DateManager.addToDate(newDate, this.options.numberOfDays));
        });
    }

    _bindEvents() {

        [].forEach.call(document.querySelectorAll('[data-type="event"]'), (el) => {
            // click on event
            this._attachClickEvent(el);
        });


        [].forEach.call(document.querySelectorAll('[data-id]'), (el) => {

            // click on cell
            el.addEventListener('click', (event) => {
                event.stopPropagation();

                switch (this.mode.current) {
                    case ADD_MODE:
                    let id = event.target.dataset.id.split('#');
                    if(!this.mode.ADD_MODE.dropAllowed) {
                        alert('Cet emplacement est déjà pris');
                    } else {
                        this.mode.ADD_MODE.callback(id[0], id[1]);
                    }
                    break;
                    default:

                }

            });

            // mouse down
            el.addEventListener('mousedown', (event) => {
                if(this.mode.current == LOCKED_MODE) {
                    this.mode.LOCKED_MODE.start = event.target.dataset.coordinate;
                    this.mode.LOCKED_MODE.mousedown = true;
                }
            });

            // mouse up
            el.addEventListener('mouseup', (event) => {
                if(this.mode.current == LOCKED_MODE) {
                    this.mode.LOCKED_MODE.end = event.target.dataset.coordinate;
                    this.mode.LOCKED_MODE.mousedown = false;

                    this.options.onLocked(this.mode.LOCKED_MODE.start, this.mode.LOCKED_MODE.end, (err, taskId) => {
                        alert('blocked event added');
                    });

                }
            });

            // hovering a cell
            el.addEventListener('mouseover', (event) => {

                switch (this.mode.current) {
                    case ADD_MODE:

                    [].forEach.call(document.querySelectorAll('[data-id]'), function(cell) {
                        cell.classList.remove('calendar-selection--allowed');
                        cell.classList.remove('calendar-selection--forbidden');
                    });

                    let cellAdress = event.target.dataset.coordinate.split('#');
                    let currentRow = cellAdress[0];
                    let cells = [];

                    let cssClass = 'calendar-selection--allowed';
                    let dropAllowed = true;

                    for(let i = 0; i < this.mode.ADD_MODE.slotsToTake ; i++) {
                        let currentCell = document.querySelector('[data-coordinate="' + currentRow + '#' + cellAdress[1] + '"]');
                        cells.push(currentCell);
                        if(currentCell.dataset.type === 'locked' || currentCell.dataset.type === 'event') {
                            cssClass = 'calendar-selection--forbidden';
                            dropAllowed = false;
                        }
                        currentRow++;
                    }

                    if(dropAllowed) {
                        this.mode.ADD_MODE.dropAllowed = true;
                    } else {
                        this.mode.ADD_MODE.dropAllowed = false;
                    }

                    cells.forEach((cell) => {
                        cell.classList.add(cssClass);
                    })
                    break;
                    case LOCKED_MODE:
                    if(this.mode.LOCKED_MODE.start !== null) {
                        let start = this.mode.LOCKED_MODE.start.split('#');
                        let current = event.target.dataset.coordinate.split('#');

                        if(current[1] == start[1] && this.mode.LOCKED_MODE.mousedown) {
                            // TODO : cache cell
                            [].forEach.call(document.querySelectorAll('.calendar-lockedTemp'), function(el) {
                                el.classList.remove('calendar-lockedTemp');
                            });

                            let startCell = parseInt(start[0]) < parseInt(current[0]) ? parseInt(start[0]) : parseInt(current[0]);
                            let endCell = parseInt(current[0]) > parseInt(start[0]) ? parseInt(current[0]) : parseInt(start[0]);

                            for(let i = startCell; i <= endCell; i++) {
                                let cellToLocked = document.querySelector('[data-coordinate="' + i + '#' + start[1] + '"]');
                                if(cellToLocked.dataset.type !== 'event') {
                                    cellToLocked.classList.add('calendar-lockedTemp');
                                }
                            }
                        }
                    }

                    default:

                }
            });

        });
    }
}

module.exports = Calendar;

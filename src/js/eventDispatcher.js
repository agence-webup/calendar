"use strict";

class EventDispatcher {

    constructor(slotDuration) {
        this.slotDuration = slotDuration;
        this.mergedEvents = [];
    }

    loadEvents(events) {
        this.events = events;
        this.mergedEvents = []; 
        this.mergeOverlappingEvents(); 
        this.mergedEvents.forEach(event => {
            this.addEvent(event);
        });
    }

    mergeOverlappingEvents() {
        // Group events by column
        const eventsByColumn = {};
        this.events.forEach(event => {
            if (!eventsByColumn[event.column]) {
                eventsByColumn[event.column] = [];
            }
            eventsByColumn[event.column].push(event);
        });
    
        // Detect and merge overlaps within each column
        Object.keys(eventsByColumn).forEach(column => {
            const columnEvents = eventsByColumn[column];
            columnEvents.sort((a, b) => a.date - b.date); // Sort by start time
            let merged = [];
    
            columnEvents.forEach(event => {
                if (merged.length === 0) {
                    // Initialize the first event
                    event.mergedEvents = [event]; // Start tracking merged events
                    merged.push(event);
                } else {
                    const lastMergedEvent = merged[merged.length - 1];
                    const lastEndTime = new Date(lastMergedEvent.date.getTime() + lastMergedEvent.duration * 60000);
                    const currentStartTime = event.date;
    
                    if (currentStartTime < lastEndTime) {
                        // Overlap detected - merge events
                        const earliestStart = lastMergedEvent.date < event.date ? lastMergedEvent.date : event.date;
                        const latestEnd = new Date(
                            Math.max(
                                lastMergedEvent.date.getTime() + lastMergedEvent.duration * 60000,
                                event.date.getTime() + event.duration * 60000
                            )
                        );
    
                        lastMergedEvent.date = earliestStart;
                        lastMergedEvent.duration = (latestEnd - earliestStart) / 60000; // Duration in minutes
                        lastMergedEvent.title += " | " + event.title;
    
                        // Append to mergedEvents array
                        lastMergedEvent.mergedEvents.push(event);
                    } else {
                        // Start a new non-overlapping event
                        event.mergedEvents = [event]; // Initialize mergedEvents for this new event
                        merged.push(event);
                    }
                }
            });
    
            this.mergedEvents.push(...merged);
        });
    }
    

    isOverlapping(event1, event2) {
        const event1End = event1.date.getTime() + event1.duration * 60000;
        const event2Start = event2.date.getTime();
        return event2Start < event1End;
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

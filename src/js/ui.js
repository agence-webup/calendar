class UI {

    constructor(target, options, events, dateManager) {
        this.target = document.querySelector(target);
        this.options = options;
        this.events = events;
        this.dateManager = dateManager;
    }

    build() {
        let table = this._buildTable();
        let dayLabels = this._buildDayLabel();
        let header = this._buildHeader();
        let body = this._buildDays();

        header.appendChild(dayLabels);

        if(this.options.showBulkActions) {
            let bulkActions = this._buildBulkActions();
            header.appendChild(bulkActions);
        }

        table.appendChild(header);
        table.appendChild(body);

        this.target.appendChild(table);
    }

    _buildTable() {
        let table = document.createElement('table');
        table.classList.add(this.options.cssClass);
        return table;
    }

    _buildHeader() {
        return document.createElement('thead');
    }

    _buildDayLabel() {
        let daysLine = document.createElement('tr');

        let firstIteration = true;
        for(let i = 0; i <= this.options.numberOfDays; i++) {
            let th = document.createElement('th');
            if(firstIteration) {
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

    _buildBulkActions() {

        let bulkActionsLine = document.createElement('tr');

        let firstIteration = true;

        for(let i = 0; i <= this.options.columnsPerDay * this.options.numberOfDays; i++) {
            let th = document.createElement('th');

            if(firstIteration) {
                firstIteration = false;
                th.innerHTML = '';
            } else {
                th.innerHTML = 'bloquer';
            }

            bulkActionsLine.appendChild(th);
        }

        return bulkActionsLine;

    }

    // TODO: place marker to use with matrix
    _buildDays() {
        let numberOfcol = this.options.columnsPerDay * this.options.numberOfDays + 1;
        let tbody = document.createElement('tbody');

        this.dateManager.hours.forEach((el, index) => {
            let line = document.createElement('tr');

            let firstIteration = true;
            for(let j = 1; j <= numberOfcol; j++) {
                let td = document.createElement('td');

                // hours label
                if(firstIteration) {
                    td.innerHTML = this.dateManager.getHoursLabel(index);
                    firstIteration = false;
                }

                line.appendChild(td);
            }

            tbody.appendChild(line);
        });

        return tbody;
    }

}

module.exports = UI;

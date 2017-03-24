class UIManager {

    constructor(target, options, events, dateManager) {
        this.target = target;
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

        //this.target.removeChild();
        if(this.target.querySelector('table')) {
            this.target.removeChild(this.target.querySelector('table'));
        }
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
                } else {
                    td.dataset.id = this.getCellId(index, j - 1);
                    td.dataset.coordinate = this.getCellCoordinate(index, j - 1);

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
    getCellId(index, column) {
        let day = Math.ceil(column/ this.options.columnsPerDay);

        let date = this.dateManager.days[day - 1];
        date.setHours(this.dateManager.hours[index].getHours());
        date.setMinutes(this.dateManager.hours[index].getMinutes());
        date.setSeconds(0);
        date.setMilliseconds(0);

        let col = column % this.options.columnsPerDay == 0 ? this.options.columnsPerDay : column % this.options.columnsPerDay;
        return date.getTime() + '#' + col;
    }

    /**
     * Get cell coordinates (row#column)
     * @param  {[type]} index  [description]
     * @param  {[type]} column [description]
     * @return [type]          [description]
     */
    getCellCoordinate(index, column) {
        return (index + 1) + '#' + column;
    }

}

module.exports = UIManager;

class UIManager {

    constructor(target, options, events, dateManager) {
        this.target = target;
        this.options = options;
        this.events = events;
        this.dateManager = dateManager;
        this.currentFooterCallback = null;
        this.ui = {
            footer: this._buildFooter()
        }

        this.listener = {
            footerBtn: null
        }
    }

    clean() {
        // clean footer
        let footer = document.querySelector('.calendar-mode');

        if(footer) {
            footer.parentNode.removeChild(footer);
        }

        // clean table
        if(this.target.querySelector('table')) {
            this.target.removeChild(this.target.querySelector('table'));
        }
        this.target.innerHTML = '';
    }
    build() {

        this.clean();

        let table = this._buildTable();
        let dayLabels = this._buildDayLabel();
        let header = this._buildHeader();
        let body = this._buildDays();
        let footer = this._buildFooter();

        header.appendChild(dayLabels);

        let bulkActions = this._buildBulkActions();
        header.appendChild(bulkActions);

        table.appendChild(header);
        table.appendChild(body);

        this.target.appendChild(table);

        // append footer
        document.body.append(this.ui.footer.wrapper);
    }

    showFooter(text, btnText = 'annuler', callback) {
        this.currentFooterCallback = callback;

        this.ui.footer.message.innerHTML = text;
        setTimeout(() => {
            this.ui.footer.wrapper.classList.add('calendar-mode--active');
        }, 10);

        this.ui.footer.btn.innerText = btnText;
    }

    hideFooter() {
        this.ui.footer.wrapper.classList.remove('calendar-mode--active');
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
                th.classList.add('calendar-bulk');
            } else {
                let button = document.createElement('button');
                button.innerHTML = UIManager.getIcon('locked');
                button.dataset.col = i;
                button.dataset.bulk = 'locked';

                th.classList.add('calendar-bulk');
                th.appendChild(button);
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

    _buildFooter(text) {
        let footer = document.createElement('div');
        footer.classList.add('calendar-mode');
        footer.innerHTML = '';

        let message = document.createElement('span');
        message.innerHTML = '';

        let footerBtn = document.createElement('button');
        footerBtn.innerText = 'Annuler';

        footer.appendChild(message);
        footer.appendChild(footerBtn);

        return {
            message: message,
            wrapper: footer,
            btn: footerBtn
        }
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

    static getIcon(icon) {
        switch(icon) {
            case 'locked':
            return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><path d="M73.668,44.387h-2.912V30.659c0-11.228-9.135-20.362-20.362-20.362c-11.229,0-20.363,9.134-20.363,20.362v13.728h-2.91  c-3.549,0-6.428,2.876-6.428,6.425v32.556c0,3.549,2.879,6.425,6.428,6.425h46.547c3.549,0,6.426-2.876,6.426-6.425V50.813  C80.094,47.264,77.217,44.387,73.668,44.387z M52.359,69.109v7.635c0,1.087-0.881,1.967-1.965,1.967  c-1.086,0-1.967-0.88-1.967-1.967v-7.635c-2.223-0.805-3.814-2.928-3.814-5.43c0-3.191,2.588-5.781,5.781-5.781  c3.19,0,5.782,2.59,5.782,5.781C56.176,66.184,54.582,68.307,52.359,69.109z M63.045,44.387H37.742V30.659  c0-6.976,5.676-12.652,12.652-12.652c6.975,0,12.651,5.676,12.651,12.652V44.387z"></path></svg>
            `
            break;
            case 'unlocked':
            return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><path d="M85.113,44.387H49.188V30.659c0-11.228-9.136-20.362-20.364-20.362S8.46,19.431,8.46,30.659V47.98  c0,2.129,1.726,3.855,3.855,3.855s3.854-1.726,3.854-3.855V30.659c0-6.976,5.676-12.652,12.653-12.652  c6.978,0,12.653,5.676,12.653,12.652v13.728h-2.911c-3.548,0-6.426,2.876-6.426,6.425v32.556c0,3.549,2.877,6.425,6.426,6.425  h46.547c3.55,0,6.427-2.876,6.427-6.425V50.813C91.539,47.264,88.662,44.387,85.113,44.387z M63.807,69.109v7.635  c0,1.087-0.883,1.967-1.967,1.967c-1.087,0-1.967-0.88-1.967-1.967v-7.635c-2.223-0.805-3.814-2.928-3.814-5.43  c0-3.191,2.59-5.781,5.781-5.781c3.192,0,5.78,2.59,5.78,5.781C67.62,66.184,66.027,68.307,63.807,69.109z"></path></svg>'
            break;
            default:
        }
    }

}

module.exports = UIManager;

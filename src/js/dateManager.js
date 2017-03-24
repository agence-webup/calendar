class DateManager {

    constructor(startDate) {
        this.startDate = startDate;

        this.startDate.setHours(0);
        this.startDate.setMinutes(0);
        this.startDate.setSeconds(0);
        this.startDate.setMilliseconds(0);

        this.days = [];
        this.hours = [];
    }

    generateDays(number) {
        // push first day
        let currentDate = this.startDate;
        this.days.push(currentDate);

        // then calculate other
        for(let i = 0; i < number; i++) {
            currentDate = this.addToDate(currentDate, 1, 0, 0, 0);
            this.days.push(currentDate);
        }
    }

    generateHours(start, end, slotDuration) {

        // parse start time and cast string to int
        let startTime = start.split(':').map((item) => {
            return parseInt(item);
        });

        // parse end time and cast string to int
        let endTime = end.split(':').map((item) => {
            return parseInt(item);
        });

        // use a date object to calculate minutes and hours (exact date is not important)
        let startDateObject = new Date();
        startDateObject.setHours(startTime[0]);
        startDateObject.setMinutes(startTime[1]);
        startDateObject.setSeconds(0);
        startDateObject.setMilliseconds(0);

        // TODO: handle day change
        let endDateObject = new Date();
        endDateObject.setHours(endTime[0]);
        endDateObject.setMinutes(endTime[1]);
        endDateObject.setSeconds(0);
        endDateObject.setMilliseconds(0);

        //console.log(startDateObject);
        //console.log(endDateObject);

        let currentDateObject = startDateObject;

        // push first occurence
        this.hours.push(currentDateObject);

        while(currentDateObject.getTime() < endDateObject.getTime()) {
            //console.log(currentDateObject);
            currentDateObject = this.addToDate(currentDateObject, 0, 0, slotDuration, 0);
            this.hours.push(currentDateObject);
        }
    }

    _addTime(time, slotDuration) {

    }

    getDayLabel(index) {
        return this.days[index - 1].toLocaleDateString();
    }

    getHoursLabel(index) {
        return this.formatLeadingZero(this.hours[index].getHours()) + ':' + this.formatLeadingZero(this.hours[index].getMinutes());
    }

    formatLeadingZero(value) {
        return ('0' + value).slice(-2);
    }


    addToDate(date, days = 0, hours = 0, minutes = 0, seconds = 0) {
        var returnDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate() + days,
            date.getHours() + hours,
            date.getMinutes() + minutes,
            date.getSeconds() + seconds,
            0
        );

        return returnDate;
    }

}

module.exports = DateManager;

import { LightningElement, wire } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import getPublicBookings from '@salesforce/apex/PublicCalendarController.getPublicBookings';

import FullCalendar from '@salesforce/resourceUrl/fullCalendar';

export default class PublicCalendar extends LightningElement {
    error;
    isLoading = false;
    cardTitle = 'I am a calendar';

    bookings;
    events;
    wiredBookings = [];

    //Sentinel so scripts only load once
    isRendered = false;

    renderedCallback() {
        if (this.isRendered) {
            return;
        }
        console.log("onrender");
        this.isRendered = true;

        Promise.all([
            loadScript(this, FullCalendar + '/fullcalendar-6.1.11/dist/index.global.min.js')
        ])
            .then(() => {
                console.log("loaded scripts")
                this.initialiseCalendar();
                this.isLoading = false;
            })
            .catch(error => {
                this.error = error;
                console.error({
                    message: 'Error occured on FullCalendar',
                    error: this.error
                });
            });
            /*
            loadScript(this, FullCalendar + '/FullCalendar/jquery.min.js'),
            loadScript(this, FullCalendar + '/FullCalendar/moment.min.js'),
            loadScript(this, FullCalendar + '/FullCalendar/fullcalendar.min.js'),
            loadStyle(this, FullCalendar + '/FullCalendar/fullcalendar.min.css'),
            // loadStyle(this, FullCalendar + '/fullcalendar.print.min.css')
            ])
            .then(() => {
                console.log("then")
                this.initialiseCalendar();
            })
            .catch(error => {
                console.error({
                    message: 'Error occured on FullCalendar',
                    error
                });
            });
            */
    }

    // Create event objects from bookings
    initialiseCalendar() {
        const ele = this.template.querySelector('div.public_field_hours-calendar');
        console.log("yep");
        $(ele).fullCalendar({
            /*
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'month,basicWeek,basicDay'
            },
            */
            // defaultDate: '2019-01-12',
            // defaultDate: new Date(), // default day is today
            // navLinks: true, // can click day/week names to navigate views
            // editable: true,
            // eventLimit: true, // allow "more" link when too many events
            // events: this.events
        });
    }

    setEvents(bookings) {
        this.events = [];
        bookings.forEach(b => {
            this.events.push({
                title: b.id,
                start: b.startTime,
                end: b.endTime
            })
        });
    }

    @wire(getPublicBookings)
    wiredResult(result) {
        this.isLoading = true;
        this.wiredBookings = result;
        if (result.data) {
            this.bookings = result.data;
            console.table(this.bookings);
            this.setEvents(this.bookings)
            this.error = undefined;
            this.isLoading = false;
        } else if (result.error) {
            console.error(result.error);
            this.error = result.error;
            this.bookings = undefined;
            this.isLoading = false;
        }
    }


    // testE = [
    //     {
    //         title: 'All Day Event',
    //         start: '2019-01-01'
    //     },
    //     {
    //         title: 'Long Event',
    //         start: '2019-01-07',
    //         end: '2019-01-10'
    //     },
    //     {
    //         id: 999,
    //         title: 'Repeating Event',
    //         start: '2019-01-09T16:00:00'
    //     },
    //     {
    //         id: 999,
    //         title: 'Repeating Event',
    //         start: '2019-01-16T16:00:00'
    //     },
    //     {
    //         title: 'Conference',
    //         start: '2019-01-11',
    //         end: '2019-01-13'
    //     },
    //     {
    //         title: 'Meeting',
    //         start: '2019-01-12T10:30:00',
    //         end: '2019-01-12T12:30:00'
    //     },
    //     {
    //         title: 'Lunch',
    //         start: '2019-01-12T12:00:00'
    //     },
    //     {
    //         title: 'Meeting',
    //         start: '2019-01-12T14:30:00'
    //     },
    //     {
    //         title: 'Happy Hour',
    //         start: '2019-01-12T17:30:00'
    //     },
    //     {
    //         title: 'Dinner',
    //         start: '2019-01-12T20:00:00'
    //     },
    //     {
    //         title: 'Birthday Party',
    //         start: '2019-01-13T07:00:00'
    //     },
    //     {
    //         title: 'Click for Google',
    //         url: 'http://google.com/',
    //         start: '2019-01-28'
    //     }
    // ];

}
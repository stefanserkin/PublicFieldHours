import { LightningElement, wire, api } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import getPublicBookings from '@salesforce/apex/PublicCalendarController.getPublicBookings';

import FullCalendarJS from '@salesforce/resourceUrl/fullCalendarV4';

export default class PublicCalendar extends LightningElement {
    @api functionName;

    error;
    isLoading = false;

    bookings;
    events;
    wiredBookings = [];
    calendar;

    get calendarTitle() {
        return `${this.functionName} Calendar`;
    }

    //Sentinel so scripts only load once
    isRendered = false;

    renderedCallback() {
        if (this.isRendered) return;

        console.log("onrender");

        this.isRendered = true;

        Promise.all([

            loadScript(this, FullCalendarJS + '/fullcalendar-4.4.3/packages/core/main.js'),
            loadStyle(this, FullCalendarJS + '/fullcalendar-4.4.3/packages/core/main.css'),

            loadScript(this, FullCalendarJS + '/fullcalendar-4.4.3/packages/daygrid/main.js'),
            loadStyle(this, FullCalendarJS + '/fullcalendar-4.4.3/packages/daygrid/main.css'),

        ])
            .then(() => {loadStyle(this, FullCalendarJS + '/fullcalendar-4.4.3/packages/core/overrides.css')})
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

    }


    // Create event objects from bookings
    initialiseCalendar() {

        var calendarEl = this.template.querySelector('div.public_field_hours-calendar');
        this.calendar = new FullCalendar.Calendar(calendarEl, {

            plugins: ['dayGrid'],
    
            height: 700,
            header: {
    
                // left: 'prev,next today',
                left: '',
                center: 'title',
                right: ''
                // right: 'dayGridMonth, dayGridWeek, dayGridDay'
            },
            
            titleFormat: { 
                year: 'numeric', month: 'long', day: 'numeric' 
            },

            columnHeaderFormat: { weekday: 'long' },

            defaultDate: new Date(),
            // defaultView: 'dayGridWeek',
            navLinks: true, // can click day/week names to navigate views
            editable: false,
            displayEventEnd: true,
            //  eventLimit: true, // allow "more" link when too many events
    
            eventTimeFormat: {
    
                hour: 'numeric',
                minute: '2-digit',
                omitZeroMinute: true,
                meridiem: 'short'
    
            },

            events: this.events,
    
            eventColor: "#00A05F",

            defaultView: 'week',
            views: {
                week: {
                    type: 'dayGrid',
                    duration: { weeks: 3 }
                }
            },

            validRange: function(nowDate) {
                return {
                  start: nowDate,
                  end: new Date(nowDate).setDate(nowDate.getDate() + 15)
                };
              }
        });

        this.calendar.render();
    }

    setEvents(bookings) {
        this.events = [];
        bookings.forEach(b => {
            this.events.push({
                title: b.eventName,
                start: new Date(b.startTime),
                end: new Date(b.endTime)
            })
        });

        this.events.sort((a, b) => a.start - b.start);
    }

    rerenderCalendar() {

        if (this.calendar) {
            this.calendar.destroy();
            this.initialiseCalendar();
        }
    }


    @wire(getPublicBookings, { functionName: '$functionName' })
    wiredResult(result) {
        this.isLoading = true;
        this.wiredBookings = result;
        if (result.data) {
            this.bookings = result.data;
            console.log(this.bookings);
            // console.log("fire")
            this.setEvents(this.bookings);
            this.rerenderCalendar();

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
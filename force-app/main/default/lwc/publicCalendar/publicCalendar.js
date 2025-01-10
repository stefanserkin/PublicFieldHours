import { LightningElement, wire, api } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import getPublicBookings from '@salesforce/apex/PublicCalendarController.getPublicBookings';

import FullCalendarJS from '@salesforce/resourceUrl/fullCalendarV4';

export default class PublicCalendar extends LightningElement {
    @api calendarTitle = 'Public Calendar';
    @api functionName;
    @api facilityNames = '';
    @api showFacilityName = false;
    @api showEventName = false;

    error;
    isLoading = false;

    bookings;
    events;
    wiredBookings = [];
    calendar;

    //Sentinel so scripts only load once
    isRendered = false;

    renderedCallback() {
        if (this.isRendered) return;
        this.isRendered = true;

        Promise.all([
            loadScript(this, FullCalendarJS + '/fullcalendar-4.4.3/packages/core/main.js'),
            loadStyle(this, FullCalendarJS + '/fullcalendar-4.4.3/packages/core/main.css'),
            loadScript(this, FullCalendarJS + '/fullcalendar-4.4.3/packages/daygrid/main.js'),
            loadStyle(this, FullCalendarJS + '/fullcalendar-4.4.3/packages/daygrid/main.css'),
        ])
            .then(() => {
                loadStyle(this, FullCalendarJS + '/fullcalendar-4.4.3/packages/core/overrides.css')
            })
            .then(() => {
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

    @wire(getPublicBookings, { functionName: '$functionName', facilityNames: '$facilityNames' })
    wiredResult(result) {
        this.isLoading = true;
        this.wiredBookings = result;
        if (result.data) {
            this.bookings = result.data;
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

    initialiseCalendar() {
        var calendarEl = this.template.querySelector('div.public_field_hours-calendar');
        this.calendar = new FullCalendar.Calendar(calendarEl, {

            plugins: ['dayGrid'],
    
            // height: 700,
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
    
            eventColor: "#00a05f",
            eventTextColor: "#fff",

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
                title: this.getEventTitle(b),
                start: new Date(b.startTime),
                end: new Date(b.endTime)
            })
        });

        this.events.sort((a, b) => a.start - b.start);
    }

    getEventTitle(booking) {
        let title = '';
        if (this.showEventName && this.showFacilityName) {
            title += booking.eventName + ' (' + booking.facilityName + ')';
        } else if (this.showFacilityName) {
            title += booking.facilityName;
        } else if (this.showEventName) {
            title += booking.eventName;
        }
        return title;
    };

    rerenderCalendar() {
        if (this.calendar) {
            this.calendar.destroy();
            this.initialiseCalendar();
        }
    }

}
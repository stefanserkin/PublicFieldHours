import { LightningElement, wire, api } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import { getLogger } from 'c/logger';
import getPublicBookings from '@salesforce/apex/PublicCalendarController.getPublicBookings';

import FullCalendarJS from '@salesforce/resourceUrl/fullCalendarV4';

export default class PublicCalendar extends LightningElement {
    @api calendarTitle = 'Public Calendar';
    @api functionName;
    @api facilityNames = '';
    @api daysToShow = 14;
    @api showFacilityName = false;
    @api showEventName = false;

    error;
    isLoading = false;
    logger = getLogger();

    bookings;
    events;
    wiredBookings = [];
    calendar;

    isRendered = false;

    renderedCallback() {
        if (this.isRendered) return;
        this.isRendered = true;

        console.log('[PublicCalendar] Starting resource load...');

        this.isLoading = true;

        loadScript(this, FullCalendarJS + '/fullcalendar-4.4.3/packages/core/main.js')
            .then(() => loadStyle(this, FullCalendarJS + '/fullcalendar-4.4.3/packages/core/main.css'))
            .then(() => loadScript(this, FullCalendarJS + '/fullcalendar-4.4.3/packages/daygrid/main.js'))
            .then(() => loadStyle(this, FullCalendarJS + '/fullcalendar-4.4.3/packages/daygrid/main.css'))
            .then(() => {
                loadStyle(this, FullCalendarJS + '/fullcalendar-4.4.3/packages/core/overrides.css');

                const style = document.createElement('style');
                style.innerText = `
                    @media only screen and (max-width: 768px) {
                        .siteforceThemeLayoutStarter {
                            z-index: 9999999999999 !important;
                        }
                        .fc-event-container .fc-event {
                            font-size: 10px !important;
                        }
                    }
                    .public_field_hours-calendar .fc-toolbar.fc-header-toolbar .fc-right { display: none; }
                `;
                document.head.appendChild(style);
            })
            .then(() => {
                this.initializeCalendar();
                this.logger.info('FullCalendar initialized successfully');
                this.logger.saveLog();
                this.isLoading = false;
            })
            .catch(error => {
                this.error = error;
                this.logger.error('Error loading FullCalendar resources', error);
                this.logger.saveLog();
                this.isLoading = false;
            });
    }

    waitForFullCalendar() {
        return new Promise((resolve, reject) => {
            let retries = 20;
            const interval = setInterval(() => {
                if (window.FullCalendar?.Calendar) {
                    clearInterval(interval);
                    resolve();
                } else if (--retries <= 0) {
                    clearInterval(interval);
                    reject(new Error('FullCalendar.Calendar not available after polling'));
                }
            }, 100);
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

    initializeCalendar() {
        var calendarEl = this.template.querySelector('div.public_field_hours-calendar');
        const numDays = this.daysToShow;
        const isMobile = window.innerWidth <= 768;

        this.calendar = new FullCalendar.Calendar(calendarEl, {
            plugins: ['dayGrid'],
            headerToolbar: {
                left: isMobile ? 'prev' : '', 
                center: 'title',
                right: isMobile ? 'next' : ''
            },
            titleFormat: { 
                year: 'numeric', month: 'long', day: 'numeric' 
            },
            columnHeaderFormat: isMobile ? { weekday: 'short' } : { weekday: 'long' },
            defaultDate: new Date(),
            navLinks: true,
            editable: false,
            displayEventEnd: true,
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
                    duration: { weeks: Math.floor(numDays / 7) + 1 }
                }
            },
            validRange: function(nowDate) {
                return {
                    start: nowDate,
                    end: new Date(nowDate).setDate(nowDate.getDate() + numDays)
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
            });
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
    }

    rerenderCalendar() {
        if (this.calendar) {
            this.calendar.destroy();
            this.initializeCalendar();
        }
    }
}
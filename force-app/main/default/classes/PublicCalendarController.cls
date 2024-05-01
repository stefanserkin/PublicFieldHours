public without sharing class PublicCalendarController {
    
    /**
     * Returns a list of Booking data wrappers for upcoming bookings
     * related to the provided function name.
     * 
     * @param functionName The name of the function to get bookings for
     * @param facilityNames A comma-separated list of facility names to filter bookings by.
     *      If blank, bookings are included for all facilities.
     * @returns {Booking[]} List of Booking objects
     */
    @AuraEnabled(cacheable=true)
    public static List<Booking> getPublicBookings(
        String functionName,
        String facilityNames
    ) {
        try {
            List<TREX1__Booking__c> lstBookings = facilityNames != null && facilityNames != ''
                ? queryForBookings(functionName, facilityNames)
                : queryForBookings(functionName);

            List<Booking> lstResults = new List<Booking>();
            for (TREX1__Booking__c bk : lstBookings) {
                Booking wrap = new Booking();
                wrap.id = bk.Id;
                wrap.eventName = bk.TREX1__Event_Name__c;
                wrap.startTime = bk.TREX1__Start_Time__c;
                wrap.endTime = bk.TREX1__End_Time__c;
                wrap.functionName = bk.TREX1__Function_Name__c;
                wrap.facilityName = bk.TREX1__Facility__r.Name;
                lstResults.add(wrap);
            }
            return lstResults;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
     * Returns a list of upcoming Booking sobject records for a given function name.
     * 
     * @param functionName The name of the function to get bookings for
     * @returns {TREX1__Booking__c[]}
     */
    private static List<TREX1__Booking__c> queryForBookings(
        String functionName
    ) {
        return [
            SELECT Id, Name, TREX1__Function_Name__c, TREX1__Facility__r.Name, TREX1__Event_Name__c, TREX1__Start_Time__c, TREX1__End_Time__c
              FROM TREX1__Booking__c 
             WHERE TREX1__Function_Name__c = :functionName
               AND TREX1__Start_Time__c >= TODAY 
              WITH SYSTEM_MODE
             ORDER BY TREX1__Start_Time__c ASC 
             LIMIT 10000
        ];
    }

    /**
     * Returns a list of upcoming Booking sobject records for a given function name and list of facilities.
     * 
     * @param functionName The name of the function to get bookings for
     * @param facilityNames A comma-separated list of facility names to filter bookings by
     * @returns {TREX1__Booking__c[]}
     */
    private static List<TREX1__Booking__c> queryForBookings(
        String functionName,
        String facilityNames
    ) {
        List<String> lstFacilityNames = facilityNames.split(',');
        return [
            SELECT Id, Name, TREX1__Function_Name__c, TREX1__Facility__r.Name, TREX1__Event_Name__c, TREX1__Start_Time__c, TREX1__End_Time__c
              FROM TREX1__Booking__c 
             WHERE TREX1__Function_Name__c = :functionName
               AND TREX1__Facility__r.Name IN :lstFacilityNames
               AND TREX1__Start_Time__c >= TODAY 
              WITH SYSTEM_MODE
             ORDER BY TREX1__Start_Time__c ASC 
             LIMIT 10000
        ];

        /*
        String strQuery = 'SELECT Id, Name, TREX1__Function_Name__c, TREX1__Facility__r.Name, TREX1__Event_Name__c, TREX1__Start_Time__c, TREX1__End_Time__c';
        strQuery += ' FROM TREX1__Booking__c';
        strQuery += ' WHERE TREX1__Function_Name__c = :functionName AND TREX1__Start_Time__c >= TODAY';

        if (facilityNames != null && facilityNames != '') {
            strQuery += ' AND TREX1__Facility__r.Name IN :facilityNames';
        }

        strQuery += ' WITH SYSTEM_MODE ORDER BY TREX1__Start_Time__c ASC LIMIT 10000';

        return Database.query(strQuery);
        */
    }

    public class Booking {
        @AuraEnabled
        public String id {get; set;}
        @AuraEnabled
        public String functionName {get; set;}
        @AuraEnabled
        public String eventName {get; set;}
        @AuraEnabled
        public DateTime startTime {get; set;}
        @AuraEnabled
        public DateTime endTime {get; set;}
        @AuraEnabled
        public String facilityName {get; set;}
    }

}
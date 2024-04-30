public without sharing class PublicCalendarController {
    
    /**
     * Returns a list of Booking data wrappers for upcoming bookings
     * related to the provided function name.
     * 
     * @param functionName The name of the function to get bookings for
     * @returns {Booking[]} List of Booking objects
     */
    @AuraEnabled(cacheable=true)
    public static List<Booking> getPublicBookings(String functionName) {
        try {
            List<Booking> lstResults = new List<Booking>();
            for (TREX1__Booking__c bk : queryForBookings(functionName)) {
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
    private static List<TREX1__Booking__c> queryForBookings(String functionName) {
        return [
            SELECT Id, Name, TREX1__Function_Name__c, TREX1__Facility__r.Name, TREX1__Event_Name__c, TREX1__Start_Time__c, TREX1__End_Time__c
              FROM TREX1__Booking__c 
             WHERE TREX1__Function_Name__c = :functionName
               AND TREX1__Start_Time__c >= TODAY 
              WITH SYSTEM_MODE
             ORDER BY TREX1__Start_Time__c ASC 
             LIMIT 100
        ];
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
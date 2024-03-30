public without sharing class PublicCalendarController {
    
    @AuraEnabled(cacheable=true)
    public static List<Booking> getPublicBookings() {
        try {
            List<Booking> lstResults = new List<Booking>();
            List<TREX1__Booking__c> lstBks = [
                SELECT Id, Name, TREX1__Function_Name__c, TREX1__Facility__r.Name, TREX1__Event_Name__c, TREX1__Start_Time__c, TREX1__End_Time__c
                  FROM TREX1__Booking__c 
                 WHERE TREX1__Function_Name__c = 'Public Field Hours' 
                   AND TREX1__Start_Time__c >= TODAY 
                  WITH SYSTEM_MODE
                 ORDER BY TREX1__Start_Time__c ASC 
                 LIMIT 100
            ];
            for (TREX1__Booking__c bk : lstBks) {
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

    public class Booking {
        @AuraEnabled
        public String id {get; set;}
        @AuraEnabled
        public String name {get; set;}
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
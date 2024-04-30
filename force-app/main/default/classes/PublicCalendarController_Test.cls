@IsTest
private class PublicCalendarController_Test {

    private static Id facilityBookingRTId = Schema.SObjectType.TREX1__Booking__c.getRecordTypeInfosByDeveloperName().get('Facility').getRecordTypeId();
    private static final String ADMIN_BOOKING_TYPE = 'Administrative';
    private static final String BOOKING_EVENT_NAME = 'Test Rental';
    private static final String BOOKING_STATUS = 'Draft';
    private static final String CALCULATION_MODE_AUTOMATIC = 'Automatic';

    @TestSetup
    static void makeData() {
        TREX1__Function__c function = TestDataFactory.createFunctions(1).get(0);
        insert function;

        TREX1__Location__c location = TestDataFactory.createLocations(1).get(0);
        insert location;

        TREX1__Facility__c facility = TestDataFactory.createFacilities(1).get(0);
        facility.TREX1__Location__c = location.Id;
        insert facility;

        List<TREX1__Booking_Contract_Option__c> lstBCOs = TestDataFactory.createBookingContractOptions(
            new List<TREX1__Facility__c>{ facility },
            new List<TREX1__Function__c>{ function }
        );
        insert lstBCOs;

        List<TREX1__Booking__c> lstBookings = new List<TREX1__Booking__c>();
        for (Integer i = 0; i < 10; i++) {
            lstBookings.add(
                new TREX1__Booking__c(
                    RecordTypeId = facilityBookingRTId,
                    TREX1__Facility__c = facility.Id,
                    TREX1__Function_ID__c = function.Id,
                    TREX1__Function_Name__c = function.Name,
                    TREX1__book_Function__c = function.Id,
                    TREX1__Type__c = ADMIN_BOOKING_TYPE,
                    TREX1__Status__c = BOOKING_STATUS,
                    TREX1__Start_Time__c = Datetime.newInstance(Date.today() + i, Time.newInstance(7, 0, 0, 0)),
                    TREX1__End_Time__c = Datetime.newInstance(Date.today() + i, Time.newInstance(8, 0, 0, 0)),
                    TREX1__Event_Name__c = BOOKING_EVENT_NAME,
                    TREX1__Setup_Time_Required__c = 0,
                    TREX1__Tear_Down_Time_Required__c = 0,
                    Booking_Rate_Calculation_Mode__c = CALCULATION_MODE_AUTOMATIC
                )
            );
        }
        insert lstBookings;
    }
    
    @IsTest
    static void testGetPublicBookings() {
        TREX1__Function__c function = [SELECT Name FROM TREX1__Function__c LIMIT 1];

        List<PublicCalendarController.Booking> lstEvents;
        Test.startTest();
        lstEvents = PublicCalendarController.getPublicBookings(function.Name);
        Test.stopTest();

        Assert.areEqual(
            function.Name, 
            lstEvents[0].functionName, 
            'Should not receive events with a different function name'
        );

        List<TREX1__Booking__c> lstBookings = [
            SELECT Id 
              FROM TREX1__Booking__c 
             WHERE TREX1__Function_Name__c = :function.Name
               AND TREX1__Start_Time__c >= TODAY
        ];

        Assert.areEqual(
            lstBookings.size(), 
            lstEvents.size(), 
            'Should have received a data wrapper object for each upcoming booking of the function type'
        );
    }
    
}


Map<String, Map<String, String>> picklistValueMap = new Map<String, Map<String, String>>{
    'Field1' => new Map<String>{
        'OldValue1' => 'NewValue1',
        'OldValue2' => 'NewValue2'
    },
    'Field2' => new Map<String>{
        'OldValue1' => 'NewValue1',
        'OldValue2' => 'NewValue2'
    }
};

Map<String, String> skillsMap = new Map<String, String>{
    'k' => 'v'
};

Map<String, String> caprMap = new Map<String, String>{
    'k' => 'v'
};

Map<String, String> hrMap = new Map<String, String>{
    'k' => 'v'
};

Map<String, String> indExpMap = new Map<String, String>{
    'k' => 'v'
};

Map<String, String> marketingMap = new Map<String, String>{
    'k' => 'v'
};

Map<String, String> odadMap = new Map<String, String>{
    'k' => 'v'
};

List<Contact> contactsWithSkills = [
    SELECT Id, Advisor_Skills__c, Skills__c, Communications_and_PR__c, HR_Management__c, Industry_Expertise__c,
           Marketing__c, Organizational_Design_and_Development__c
      FROM Contact
     WHERE (Skills__c != null
        OR Communications_and_PR__c != null
        OR HR_Management__c != null
        OR Industry_Expertise__c != null
        OR Marketing__c != null
        OR Organizational_Design_and_Development__c != null
        OR Strategic_Planning_Industry__c != null
        OR Financial_Planning_and_Management__c != null
        OR Access_to_Capital_and_Fundraising__c != null
        OR Exit_Strategies__c != null
        OR Sales__c != null
        OR Operations_BusinessProcess_Manufacturing__c != null)
];

for (Contact ct : contactsWithSkills) {
    Set<String> advisorSkills = new Set<String>();

    if (ct.Skills__c != null) {
        Map<String, String> skillsMap = picklistValueMap.get('Skills__c');
        for (String sk : ct.Skills__c.split(';')) {
            if (skillsMap.containsKey(sk)) {
                advisorSkills.add(skillsMap.get(sk));
            } else {
                advisorSkills.add(sk);
            }
        }
    }
}


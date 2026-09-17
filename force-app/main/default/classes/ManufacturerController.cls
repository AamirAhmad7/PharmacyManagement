public with sharing class ManufacturerController {
    
    @AuraEnabled(cacheable=true)
    public static List<Manufacturer__c> getManufacturers(){
        return [
            SELECT Id, Name, Contact_Person__c, Contact_Phone__c, Contact_Email__c, License_Number__c
            FROM Manufacturer__c
            ORDER BY CreatedDate DESC
        ];
    }

    @AuraEnabled
    public static Manufacturer__c saveManufacturer(String recordId, String name, String contactPerson, String phone, String email, String licenseNumber){
        Manufacturer__c manuf = new Manufacturer__c(
            Name = name,
            Contact_Person__c = contactPerson,
            Contact_Phone__c = phone,
            Contact_Email__c = email,
            License_Number__c = licenseNumber
        );

        // If recordId exists, update the existing record; otherwise insert new record
        if (String.isNotBlank(recordId)) {
            manuf.Id = recordId;
            update manuf;
        } else {
            insert manuf;
        }

        return manuf;
    }

    @AuraEnabled
    public static void deleteManufacturer(String recordId){
        if (String.isNotBlank(recordId)) {
            delete new Manufacturer__c(Id = recordId);
        }
    }
}
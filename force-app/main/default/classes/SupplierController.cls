public with sharing class SupplierController {

   @AuraEnabled(cacheable=true)
    public static List<supplier__c> getSuppliers(){
        return [
            select Id, Name, Address__c, Contact_Person__c, Phone__c, Email__c, Payment_Terms__c From supplier__c

        ];
    }

    @AuraEnabled
    public static supplier__c saveSupplier(string name, string address, string contactPerson, string phone, string email, string paymentTerms)
{
    supplier__C newSupplier = new supplier__c(
        Name = name,
        Address__c=address,
        Contact_Person__c=contactPerson,
        Phone__c=phone,
        Email__c=email,
        Payment_Terms__c=paymentTerms
    );
    insert newSupplier;
    return newSupplier;
}

@AuraEnabled
    public static void editSupplier(string recordId, string name, string address, string contactPerson, string phone, string email, string paymentTerms){
        if(String.isNotBlank(recordId)){
            supplier__c supplier = [SELECT Id FROM supplier__c WHERE Id = :recordId];
            supplier.Name = name;
            supplier.Address__c = address;
            supplier.Contact_Person__c = contactPerson;
            supplier.Phone__c = phone;
            supplier.Email__c = email;
            supplier.Payment_Terms__c = paymentTerms;
            update supplier;
        }
    }

    @AuraEnabled 
    public static void deleteSupplier(string recordId){
        if(string.isNotBlank(recordId)){
            supplier__c supplier =[select Id from supplier__c where Id = :recordId];
            delete supplier;
        }
    }
}
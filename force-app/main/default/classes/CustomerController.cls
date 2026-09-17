public with sharing class CustomerController {

    // =========================
    // GET CUSTOMERS
    // =========================
    @AuraEnabled(cacheable=true)
    public static List<Customer__c> getCustomers() {

        return [
            SELECT Id,
                   Name,
                   Email__c,
                   Phone__c,
                   Address__c,
                   Medical_History_Notes__c
            FROM Customer__c
            ORDER BY CreatedDate DESC
        ];
    }


    // =========================
    // CREATE CUSTOMER
    // =========================
    @AuraEnabled
    public static Customer__c createCustomer(
        String name,
        String email,
        String phone,
        String address,
        String medicalHistory
    ) {

        Customer__c newCustomer = new Customer__c(
            Name = name,
            Email__c = email,
            Phone__c = phone,
            Address__c = address,
            Medical_History_Notes__c = medicalHistory
        );

        insert newCustomer;

        return newCustomer;
    }


    // =========================
    // UPDATE CUSTOMER
    // =========================
    @AuraEnabled
    public static Customer__c updateCustomer(
        Id customerId,
        String name,
        String email,
        String phone,
        String address,
        String medicalHistory
    ) {

        Customer__c customer = [
            SELECT Id
            FROM Customer__c
            WHERE Id = :customerId
            LIMIT 1
        ];

        customer.Name = name;
        customer.Email__c = email;
        customer.Phone__c = phone;
        customer.Address__c = address;
        customer.Medical_History_Notes__c = medicalHistory;

        update customer;

        return customer;
    }

    @AuraEnabled 
    public static void deleteCustomer(Id customerId){
        Customer__c customer =[
            select Id from Customer__c where Id = :customerId
        ];
        delete customer;
    }
}
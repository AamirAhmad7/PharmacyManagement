public with sharing class PurchaseOrderDetailController {
    
    @AuraEnabled(cacheable=true)
    public static Purchase_Order__c getPurchaseOrders(Id recordId){

        return [select Name, Supplier__r.Name, Order_Date__c , Status__c, Total_Cost__c from Purchase_Order__c WHERE Id = :recordId];

    }
}
public with sharing class salesOrderController {

    @AuraEnabled(cacheable=true)
    public static List<Sales_Order__c> getSalesOrders() {
        return [SELECT Id, Name, Customer__c, Customer__r.Name, Order_Date__c, Status__c, Payment_Status__c, Total_Amount__c FROM Sales_Order__c ORDER BY CreatedDate DESC];
    }

    @AuraEnabled
    public static Sales_Order__c saveSalesOrder(Id recordId, Id customerId, Datetime orderDate, String status, String paymentStatus) {
        Sales_Order__c order;
        if (recordId == null) {
            order = new Sales_Order__c();
        } else {
            order = [SELECT Id FROM Sales_Order__c WHERE Id = :recordId LIMIT 1];
        }
        order.Customer__c = customerId;
        order.Order_Date__c = orderDate;
        order.Status__c = status;
        order.Payment_Status__c = paymentStatus;
        upsert order;
        return order;
    }

    @AuraEnabled
    public static void deleteSalesOrder(Id recordId) {
        Sales_Order__c order = [SELECT Id FROM Sales_Order__c WHERE Id = :recordId LIMIT 1];
        delete order;
    }
}
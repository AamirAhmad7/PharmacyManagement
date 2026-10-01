public with sharing class purchaseOrderController {

    // Get Purchase Orders
    @AuraEnabled(cacheable=true)
    public static List<Purchase_Order__c> getPurchaseOrders() {
        return [SELECT Id, Name, Supplier__c, Supplier__r.Name, Order_Date__c, Status__c, Total_Cost__c FROM Purchase_Order__c ORDER BY CreatedDate DESC];
    }

    // Create or Update Purchase Order
    @AuraEnabled
    public static Purchase_Order__c savePurchaseOrder(Id recordId, Id supplierId, Date orderDate, String status) {
        Purchase_Order__c purchaseOrder;

        // Edit existing Purchase Order
        if (recordId != null) {
            purchaseOrder = [SELECT Id FROM Purchase_Order__c WHERE Id = :recordId LIMIT 1];
        } else {
            // Create new Purchase Order
            purchaseOrder = new Purchase_Order__c();
        }

        // Set fields
        purchaseOrder.Supplier__c = supplierId;
        purchaseOrder.Order_Date__c = orderDate;
        purchaseOrder.Status__c = status;

        // Save record
        upsert purchaseOrder;

        // Return saved record
        return purchaseOrder;
    }

   @AuraEnabled
public static void deletePurchaseOrder(Id rowId) {
    Purchase_Order__c order = [SELECT Id FROM Purchase_Order__c WHERE Id = :rowId LIMIT 1];
    delete order;
}
}
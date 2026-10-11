public with sharing class PurchaseOrderDetailController {
    
   @AuraEnabled(cacheable=true)
public static Purchase_Order__c getPurchaseOrders(Id recordId) {
    return [
        SELECT Name,
               Supplier__r.Name,
               Order_Date__c,
               Status__c,
               Total_Cost__c
        FROM Purchase_Order__c
        WHERE Id = :recordId
    ];
}

    @AuraEnabled(cacheable=true)
    public static List<Purchase_Order_Line_Item__c> getLineItems(
        Id purchaseOrderId
    ) {
        if (purchaseOrderId == null) {
            return new List<Purchase_Order_Line_Item__c>();
        }

        return [
            SELECT Id,
                   Product__c,
                   Product__r.Name,
                   Quantity__c,
                   Unit_Price__c,
                   Line_Total__c
            FROM Purchase_Order_Line_Item__c
            WHERE Purchase_Order__c = :purchaseOrderId
            ORDER BY CreatedDate ASC
        ];
    }

    @AuraEnabled
    public static void saveLineItems(
        Id purchaseOrderId,
        List<Purchase_Order_Line_Item__c> lineItems
    ) {
        if (
            purchaseOrderId == null ||
            lineItems == null ||
            lineItems.isEmpty()
        ) {
            return;
        }

        for (Purchase_Order_Line_Item__c item : lineItems) {
            item.Purchase_Order__c = purchaseOrderId;
        }

        insert lineItems;
    }
}
public with sharing class SalesOrderDetailController {

    // Fetch Header Details
    @AuraEnabled(cacheable=true)
    public static Sales_Order__c getSalesOrder(Id recordId) {
        if (recordId == null) {
            return null;
        }
        return [
            SELECT Id,
                   Name,
                   Status__c,
                   Payment_Status__c,
                   Total_Amount__c,
                   Customer__r.Name
            FROM Sales_Order__c
            WHERE Id = :recordId
            LIMIT 1
        ];
    }

    // Fetch Line Items
    @AuraEnabled(cacheable=true)
    public static List<Sales_Order_Line_Item__c> getLineItems(Id salesOrderId) {
        if (salesOrderId == null) {
            return new List<Sales_Order_Line_Item__c>();
        }
        return [
            SELECT Id,
                   Product__c,
                   Product__r.Name,
                   Quantity__c,
                   Unit_Price__c,
                   Subtotal__c
            FROM Sales_Order_Line_Item__c
            WHERE Sales_Order__c = :salesOrderId
            ORDER BY CreatedDate ASC
        ];
    }

    // Save Line Items
    @AuraEnabled
    public static void saveLineItems(Id salesOrderId, List<Sales_Order_Line_Item__c> lineItems) {
        if (salesOrderId == null || lineItems == null || lineItems.isEmpty()) {
            return;
        }

        for (Sales_Order_Line_Item__c item : lineItems) {
            item.Sales_Order__c = salesOrderId;
        }

        insert lineItems;
    }
}
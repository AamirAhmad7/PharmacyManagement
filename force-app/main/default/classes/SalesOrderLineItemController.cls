public with sharing class SalesOrderLineItemController {

    @AuraEnabled
    public static Sales_Order_Line_Item__c saveLineItem(Id recordId, Id salesOrderId, Id productId, Decimal quantity, Decimal unitPrice) {
        Sales_Order_Line_Item__c lineItem;
        if (recordId == null) {
            lineItem = new Sales_Order_Line_Item__c();
        } else {
            lineItem = [SELECT Id FROM Sales_Order_Line_Item__c WHERE Id = :recordId LIMIT 1];
        }
        lineItem.Sales_Order__c = salesOrderId;
        lineItem.Product__c = productId;
        lineItem.Quantity__c = quantity;
        lineItem.Unit_Price__c = unitPrice;
        upsert lineItem;
        return lineItem;
    }
}
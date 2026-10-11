
import { LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';

import getPurchaseOrders
    from '@salesforce/apex/PurchaseOrderDetailController.getPurchaseOrders';

import getLineItems
    from '@salesforce/apex/PurchaseOrderDetailController.getLineItems';

export default class PurchaseOrderDetail extends LightningElement {

    recordId;
    data;
    
    wiredResult;
    wiredLineItemsResult;

    lineItems = [];
    isModalOpen = false;

    // Datatable columns: match the exact Apex field names
  lineItemColumns = [
    { label: 'Product', fieldName: 'ProductName', type: 'text' },
    { label: 'Quantity', fieldName: 'Quantity__c', type: 'number' },
    { label: 'Unit Cost', fieldName: 'Unit_Price__c', type: 'currency' },
    { label: 'Line Total', fieldName: 'Line_Total__c', type: 'currency' }
];
    // Get Purchase Order ID from navigation state
    @wire(CurrentPageReference)
    pageRef(currentPageReference) {
        if (currentPageReference?.state?.c__recordId) {
            this.recordId = currentPageReference.state.c__recordId;
        }
    }

    // Load Purchase Order header
    @wire(getPurchaseOrders, { recordId: '$recordId' })
    wirePurchaseOrder(result) {
        this.wiredResult = result;

        if (result.data) {
            this.data = result.data;
        } else if (result.error) {
            console.error('Purchase Order Error:', result.error);
        }
    }

    // Load Purchase Order Line Items
    @wire(getLineItems, { purchaseOrderId: '$recordId' })
    wireLineItems(result) {
        this.wiredLineItemsResult = result;

        if (result.data) {
            // Flatten Product__r.Name for lightning-datatable
            this.lineItems = result.data.map(item => ({
                ...item,
                ProductName: item.Product__r
                    ? item.Product__r.Name
                    : ''
            }));
        } else if (result.error) {
            console.error('Line Item Error:', result.error);
        }
    }

    // Display Supplier Name
    get supplierName() {
        return this.data?.Supplier__r
            ? this.data.Supplier__r.Name
            : '';
    }

    // Check whether line items exist
    get hasLineItems() {
        return this.lineItems.length > 0;
    }

    // Open New Line Item modal
    handleNewLineItem() {
        this.isModalOpen = true;
    }

    // Close modal
    closeModal() {
        this.isModalOpen = false;
    }

    // Refresh line items after successful save
    async handleLineItemsSaved() {
        this.isModalOpen = false;

        try {
            await refreshApex(this.wiredLineItemsResult);
            await refreshApex(this.wiredResult);
        } catch (error) {
            console.error('Refresh Error:', error);
        }
    }
}

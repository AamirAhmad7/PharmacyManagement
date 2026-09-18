import { LightningElement, api, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import getSalesOrder from '@salesforce/apex/SalesOrderDetailController.getSalesOrder';
import getLineItems from '@salesforce/apex/SalesOrderDetailController.getLineItems';

export default class SalesOrderDetail extends LightningElement {
    @api recordId;
    salesOrder;
    lineItems = [];
    isModalOpen = false;

    wiredSalesOrderResult;
    wiredLineItemsResult;

    lineItemColumns = [
        { label: 'Product', fieldName: 'ProductName' },
        { label: 'Quantity', fieldName: 'Quantity', type: 'number' },
        { label: 'Unit Price', fieldName: 'UnitPrice', type: 'currency' },
        { label: 'Subtotal', fieldName: 'Subtotal', type: 'currency' }
    ];

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference?.state?.c__recordId) {
            this.recordId = currentPageReference.state.c__recordId;
        }
    }

    @wire(getSalesOrder, { recordId: '$recordId' })
    wiredSalesOrder(result) {
        this.wiredSalesOrderResult = result;
        if (result.data) {
            this.salesOrder = result.data;
        } else if (result.error) {
            console.error('Sales Order Error:', result.error);
        }
    }

    @wire(getLineItems, { salesOrderId: '$recordId' })
    wiredLineItems(result) {
        this.wiredLineItemsResult = result;
        if (result.data) {
            this.lineItems = result.data.map(item => ({
                Id: item.Id,
                ProductName: item.Product__r ? item.Product__r.Name : '',
                Quantity: item.Quantity__c,
                UnitPrice: item.Unit_Price__c,
                Subtotal: item.Subtotal__c
            }));
        } else if (result.error) {
            console.error('Line Item Error:', result.error);
            this.lineItems = [];
        }
    }

    get hasLineItems() {
        return Array.isArray(this.lineItems) && this.lineItems.length > 0;
    }

    get customerName() {
        return this.salesOrder?.Customer__r ? this.salesOrder.Customer__r.Name : '';
    }

    handleNewLineItem() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    handleLineItemsSaved() {
        this.closeModal();
        refreshApex(this.wiredSalesOrderResult);
        refreshApex(this.wiredLineItemsResult);
    }
}
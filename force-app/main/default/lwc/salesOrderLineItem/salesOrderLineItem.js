import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import saveLineItems from '@salesforce/apex/SalesOrderDetailController.saveLineItems';

export default class SalesOrderLineItem extends LightningElement {
    @api salesOrderId;

    displayInfo = {
        primaryField: 'Name',
        additionalFields: ['ProductCode']
    };

    matchingInfo = {
        primaryField: { fieldPath: 'Name' }
    };

    items = [
        { key: 0, Product__c: '', Quantity__c: 1, Unit_Price__c: 0 }
    ];
    keyCounter = 1;

    get isOnlyOneRow() {
        return this.items.length <= 1;
    }

    handleAddRow() {
        this.items = [
            ...this.items,
            { key: this.keyCounter++, Product__c: '', Quantity__c: 1, Unit_Price__c: 0 }
        ];
    }

    handleRemoveRow(event) {
        const index = parseInt(event.target.dataset.index, 10);
        if (this.items.length > 1) {
            this.items = this.items.filter((_, i) => i !== index);
        }
    }

    handleRowChange(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const fieldName = event.target.name;
        const value = fieldName === 'product' ? event.detail.recordId : event.detail.value;

        const updatedItems = [...this.items];
        if (fieldName === 'product') {
            updatedItems[index].Product__c = value;
        } else if (fieldName === 'quantity') {
            updatedItems[index].Quantity__c = value ? parseInt(value, 10) : 0;
        } else if (fieldName === 'unitPrice') {
            updatedItems[index].Unit_Price__c = value ? parseFloat(value) : 0;
        }
        this.items = updatedItems;
    }

    handleSave() {
        const invalidItems = this.items.some(item => !item.Product__c || item.Quantity__c <= 0);
        if (invalidItems) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Validation Error',
                message: 'Please select a medicine and valid quantity for all rows.',
                variant: 'error'
            }));
            return;
        }

        const payload = this.items.map(item => ({
            Product__c: item.Product__c,
            Quantity__c: item.Quantity__c,
            Unit_Price__c: item.Unit_Price__c
        }));

        saveLineItems({ salesOrderId: this.salesOrderId, lineItems: payload })
            .then(() => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'Medicines added to Sales Order successfully',
                    variant: 'success'
                }));
                this.dispatchEvent(new CustomEvent('saved'));
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error Saving Line Items',
                    message: error.body?.message || 'Failed to save items',
                    variant: 'error'
                }));
            });
    }

    closeModal() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}
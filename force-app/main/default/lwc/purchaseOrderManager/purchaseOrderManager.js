import { LightningElement, wire } from 'lwc';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import PURCHASE_ORDER_OBJECT from '@salesforce/schema/Purchase_Order__c';
import STATUS_FIELD from '@salesforce/schema/Purchase_Order__c.Status__c';

import getPurchaseOrders from '@salesforce/apex/purchaseOrderController.getPurchaseOrders';
import savePurchaseOrder from '@salesforce/apex/purchaseOrderController.savePurchaseOrder';
import deletePurchaseOrder from '@salesforce/apex/purchaseOrderController.deletePurchaseOrder';
import { NavigationMixin } from 'lightning/navigation';

export default class PurchaseOrderManager extends NavigationMixin (LightningElement) {

    columns = [
        { label: 'Purchase Order', fieldName: 'Name', type: 'button', typeAttributes: { label: { fieldName: 'Name' }, name: 'view', variant: 'base' } },
        { label: 'Supplier', fieldName: 'SupplierName' },
        { label: 'Order Date', fieldName: 'Order_Date__c', type: 'date', typeAttributes: { year: 'numeric', month: '2-digit', day: '2-digit' } },
        { label: 'Status', fieldName: 'Status__c' },
        { label: 'Total Amount', fieldName: 'Total_Cost__c', type: 'currency' },
        { type: 'action', typeAttributes: { rowActions: [{ label: 'Edit', name: 'edit' }, { label: 'Delete', name: 'delete' }] } }
    ];

    isModalOpen = false;
    statusOptions = [];
    supplierId;
    selectedStatus;
    orderDate;
    purchaseOrderId;
    data = [];
    wiredPurchaseorderResult;

    @wire(getPurchaseOrders)
    wiredPurchaseOrders(result) {
        this.wiredPurchaseorderResult = result;

        if (result.data) {
            this.data = result.data.map(order => {
                return { ...order, SupplierName: order.Supplier__r ? order.Supplier__r.Name : '' };
            });
        } else if (result.error) {
            console.error('Error fetching Purchase Orders:', result.error);
        }
    }

    @wire(getObjectInfo, { objectApiName: PURCHASE_ORDER_OBJECT })
    objectInfo;

    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: STATUS_FIELD })
    wiredStatusValues({ data, error }) {
        if (data) {
            this.statusOptions = data.values.map(item => ({ label: item.label, value: item.value }));
        } else if (error) {
            console.error('Error loading Status values:', error);
        }
    }

    handleInputChange(event) {
        const fieldName = event.target.name;

        if (fieldName === 'supplier') {
            this.supplierId = event.detail.recordId;
        }
        if (fieldName === 'orderDate') {
            this.orderDate = event.target.value;
        }
        if (fieldName === 'purchaseStatus') {
            this.selectedStatus = event.target.value;
        }
    }

   handleSave() {
    
    savePurchaseOrder({
        recordId: this.purchaseOrderId,
        supplierId: this.supplierId,
        orderDate: this.orderDate,
        status: this.selectedStatus
    })
    .then(() => {
        return refreshApex(this.wiredPurchaseorderResult);
    })
    .then(() => {
        this.isModalOpen = false;
        this.showToast('Success', 'Purchase Order saved successfully', 'success');
        this.resetform();
    })
    .catch(error => {
        console.error('Error saving Purchase Order:', error);
        this.showToast('Error', error.body ? error.body.message : 'Error saving Purchase Order', 'error');
    });
}


handleRowAction(event) {
    debugger;
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        switch (actionName) {
            case 'view':
                this[NavigationMixin.Navigate]({
                    type: 'standard__navItemPage',
                    attributes: {
                        apiName: 'Purchase_Order_Detail'
                    },
                    state : {
                        c__recordId: row.Id
                    }
                });
                break;

            case 'edit':
                this.purchaseOrderId = row.Id;
                this.supplierId = row.Supplier__c;
                this.selectedStatus = row.Status__c;
                this.orderDate = row.Order_Date__c;
                this.isModalOpen = true;
                break;

            case 'delete':
                deletePurchaseOrder({ customerId: row.Id })
                    .then(() => {
                        this.showToast('Success', 'Purchase Order deleted successfully', 'success');
                        return refreshApex(this.wiredPurchaseorderResult);
                    })
                    .catch(error => {
                        console.error('Error deleting Purchase Order:', error);
                        this.showToast('Error', error.body ? error.body.message : 'Error deleting Purchase Order', 'error');
                    });
                break;
        }
    }   

    openModal() {
        this.orderDate = new Date().toISOString();
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title: title, message: message, variant: variant }));
    }

    resetform() {
        this.purchaseOrderId = null;
        this.supplierId = null;
        this.selectedStatus = null;
    }
}
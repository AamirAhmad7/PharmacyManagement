import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

// Object and field imports
import SALES_ORDER_OBJECT from '@salesforce/schema/Sales_Order__c';
import STATUS_FIELD from '@salesforce/schema/Sales_Order__c.Status__c';
import PAYMENT_STATUS_FIELD from '@salesforce/schema/Sales_Order__c.Payment_Status__c';

// Apex methods
import getSalesOrders from '@salesforce/apex/salesOrderController.getSalesOrders';
import saveSalesOrder from '@salesforce/apex/salesOrderController.saveSalesOrder';
import deleteSalesOrder from '@salesforce/apex/salesOrderController.deleteSalesOrder';

export default class SalesOrderManager extends NavigationMixin(LightningElement) {

    // Datatable columns
    columns = [
        { label: 'Sales Order', fieldName: 'Name', type: 'button', typeAttributes: { label: { fieldName: 'Name' }, name: 'view', variant: 'base' } },
        { label: 'Customer', fieldName: 'CustomerName' },
        { label: 'Order Date', fieldName: 'Order_Date__c', type: 'date', typeAttributes: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' } },
        { label: 'Status', fieldName: 'Status__c' },
        { label: 'Payment Status', fieldName: 'Payment_Status__c' },
        { label: 'Total Amount', fieldName: 'Total_Amount__c', type: 'currency' },
        { type: 'action', typeAttributes: { rowActions: [{ label: 'Edit', name: 'edit' }, { label: 'Delete', name: 'delete' }] } }
    ];

    // Component variables
    data = [];
    isModalOpen = false;
    statusOptions = [];
    paymentStatusOptions = [];
    salesOrderId;
    customerId;
    orderDate;
    selectedStatus;
    selectedPaymentStatus;
    wiredSalesOrdersResult;

    // Get Sales Order object information
    @wire(getObjectInfo, { objectApiName: SALES_ORDER_OBJECT })
    objectInfo;

    // Get Status picklist values
    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: STATUS_FIELD })
    wiredStatusValues({ data, error }) {
        if (data) {
            this.statusOptions = data.values.map(item => ({ label: item.label, value: item.value }));
        }
        if (error) {
            console.error('Error loading Status values:', error);
        }
    }

    // Get Payment Status picklist values
    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: PAYMENT_STATUS_FIELD })
    wiredPaymentStatusValues({ data, error }) {
        if (data) {
            this.paymentStatusOptions = data.values.map(item => ({ label: item.label, value: item.value }));
        }
        if (error) {
            console.error('Error loading Payment Status values:', error);
        }
    }

    // Get Sales Orders
    @wire(getSalesOrders)
    wiredSalesOrders(result) {
        this.wiredSalesOrdersResult = result;
        if (result.data) {
            this.data = result.data.map(order => ({
                ...order,
                CustomerName: order.Customer__r ? order.Customer__r.Name : ''
            }));
        }
        if (result.error) {
            console.error('Error loading Sales Orders:', result.error);
        }
    }

    // Handle form input changes
    handleInputChange(event) {
        const fieldName = event.target.name;
        let value;

        // Get Customer Id from record picker
        if (fieldName === 'customer') {
            value = event.detail.recordId;
        } else {
            value = event.detail.value || event.target.value;
        }

        // Store the value according to the field
        switch (fieldName) {
            case 'customer':
                this.customerId = value;
                break;
            case 'orderDate':
                if (value) {
                    this.orderDate = new Date(value).toISOString();
                }
                break;
            case 'orderStatus':
                this.selectedStatus = value;
                break;
            case 'paymentStatus':
                this.selectedPaymentStatus = value;
                break;
        }
    }

    // Create or update Sales Order
    handleSave() {
        const isEdit = this.salesOrderId != null;

        saveSalesOrder({
            recordId: this.salesOrderId,
            customerId: this.customerId,
            orderDate: this.orderDate,
            status: this.selectedStatus,
            paymentStatus: this.selectedPaymentStatus
        })
        .then(result => {
            this.salesOrderId = result.Id;

            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: isEdit ? 'Sales Order updated' : 'Sales Order created',
                variant: 'success'
            }));

            refreshApex(this.wiredSalesOrdersResult);
            this.closeModal();
            this.resetForm();
        })
        .catch(error => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: error.body?.message || 'Error saving Sales Order',
                variant: 'error'
            }));
        });
    }

    // Handle Row Actions (View, Edit, Delete)
    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        if (actionName === 'view') {
            this[NavigationMixin.Navigate]({
                type: 'standard__navItemPage',
                attributes: {
                    apiName: 'Sales_Order_Detail'
                },
                state: {
                    c__recordId: row.Id
                }
            });
        } else if (actionName === 'edit') {
            this.salesOrderId = row.Id;
            this.customerId = row.Customer__c;
            this.orderDate = row.Order_Date__c ? row.Order_Date__c.slice(0, 16) : null;
            this.selectedStatus = row.Status__c;
            this.selectedPaymentStatus = row.Payment_Status__c;
            this.isModalOpen = true;
        } else if (actionName === 'delete') {
            this.deleteSalesOrder(row.Id);
        }
    }

    // Delete Sales Order
    deleteSalesOrder(recordId) {
        deleteSalesOrder({ recordId: recordId })
        .then(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Deleted',
                message: 'Sales Order deleted',
                variant: 'success'
            }));

            return refreshApex(this.wiredSalesOrdersResult);
        })
        .catch(error => {
            console.error('Error deleting Sales Order:', error);
        });
    }

    // Open Sales Order modal
    openModal() {
        debugger;
        this.isModalOpen = true;
        this.orderDate = new Date().toISOString();
    }

    // Close Sales Order modal
    closeModal() {
        this.isModalOpen = false;
    }

    // Reset form values
    resetForm() {
        this.salesOrderId = null;
        this.customerId = null;
        this.orderDate = null;
        this.selectedStatus = null;
        this.selectedPaymentStatus = null;
    }
}
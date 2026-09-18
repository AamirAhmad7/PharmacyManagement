import { LightningElement, wire } from 'lwc';
import getSuppliers from '@salesforce/apex/SupplierController.getSuppliers';
import saveSupplier from '@salesforce/apex/SupplierController.saveSupplier';
import editSupplier from '@salesforce/apex/SupplierController.editSupplier';
import { refreshApex } from '@salesforce/apex';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import SUPPLIER_OBJECT from '@salesforce/schema/Supplier__c';
import PAYMENT_TERMS_FIELD from '@salesforce/schema/Supplier__c.Payment_Terms__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import deleteSupplier from '@salesforce/apex/SupplierController.deleteSupplier';

export default class SupplierManager extends LightningElement {

    columns = [
        { label: 'Supplier Name', fieldName: 'Name' }, 
        { label: 'Address', fieldName: 'Address__c' }, 
        { label: 'Contact Person', fieldName: 'Contact_Person__c' }, 
        { label: 'Phone', fieldName: 'Phone__c' }, 
        { label: 'Email', fieldName: 'Email__c' }, 
        { label: 'Payment Terms', fieldName: 'Payment_Terms__c' }, 
        { 
            type: 'action',
            typeAttributes: { 
                rowActions: [
                    { label: 'Edit', name: 'edit' }, 
                    { label: 'Delete', name: 'delete' }
                ]
             } 
        }
    ];
    suppliers;
    supplierWiredResult;
    isModalOpen = false;
    Name = '';
    address = '';
    contactPerson = '';
    phone = '';
    email = '';
    paymentTerms = '';

    supplierRecordTypeId;
    paymentTermsOptions = [];

    editingSupplierId = null;   // Tracks target record Id (null = Create Mode, Id = Edit Mode)

    @wire(getObjectInfo, { objectApiName: SUPPLIER_OBJECT })
    supplierObjectInfo({ data, error }) {
        if (data) {
            this.supplierRecordTypeId = data.defaultRecordTypeId;
        } else if (error) {
            console.error('Error getting Supplier object info:', error);
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: '$supplierRecordTypeId',
        fieldApiName: PAYMENT_TERMS_FIELD
    })
    paymentTermsPicklist({ data, error }) {
        if (data) {
            this.paymentTermsOptions = data.values;
        } else if (error) {
            console.error('Error getting Payment Terms:', error);
        }
    }

    @wire(getSuppliers)
    supplierswired(result) {
        this.supplierWiredResult = result;
        if (result.data) {
            this.suppliers = result.data;
        } else if (result.error) {
            console.error('Error fetching suppliers:', result.error);
        }
    }

    handleChange(event) {
        const field = event.target.name;
        const value = event.target.value;

        if (field === 'Name') {
            this.Name = value;
        } else if (field === 'Address__c') {
            this.address = value;
        } else if (field === 'Contact_Person__c') {
            this.contactPerson = value;
        } else if (field === 'Phone__c') {
            this.phone = value;
        } else if (field === 'Email__c') {
            this.email = value;
        } else if (field === 'Payment_Terms__c') {
            this.paymentTerms = value;
        }
    }

    handleSave() {
        if (!this.editingSupplierId) {
            saveSupplier({
                name: this.Name,
                address: this.address,
                contactPerson: this.contactPerson,
                phone: this.phone,
                email: this.email,
                paymentTerms: this.paymentTerms
            })
            .then(() => {
                this.isModalOpen = false;
                this.resetForm();
                return refreshApex(this.supplierWiredResult);
            })
            .catch(error => {
                console.error('Error saving supplier:', error);
            });
        } else {
            editSupplier({
                recordId: this.editingSupplierId,
                name: this.Name,
                address: this.address,
                contactPerson: this.contactPerson,
                phone: this.phone,
                email: this.email,
                paymentTerms: this.paymentTerms
            })
            .then(() => {
                this.isModalOpen = false;
                this.resetForm();
                return refreshApex(this.supplierWiredResult);
            })
            .catch(error => {
                console.error('Error editing supplier:', error);
            });
        }
    } // <-- Fixed: Added missing closing brace for handleSave()

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        if (actionName === 'edit') {
            this.editAction(row);
        } else if (actionName === 'delete') {
            this.deleteAction(row);
        } 
    }

    editAction(row) {
        this.editingSupplierId = row.Id;
        this.Name = row.Name || '';
        this.address = row.Address__c || '';
        this.contactPerson = row.Contact_Person__c || '';
        this.phone = row.Phone__c || '';
        this.email = row.Email__c || '';
        this.paymentTerms = row.Payment_Terms__c || '';
        this.isModalOpen = true;
    }

   deleteAction(row) {
    if (confirm('Are you sure you want to delete this supplier?')) {
        deleteSupplier({ recordId: row.Id })
            .then(() => {
                this.showToast(
                    'Success',
                    'Supplier deleted successfully',
                    'success'
                );
                return refreshApex(this.supplierWiredResult);
            })
            .catch(error => {
                console.error('Error deleting supplier:', error);
                this.showToast(
                    'Error',
                    error.body?.message || 'Error deleting supplier',
                    'error'
                );
            });
    }
}

    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
        this.resetForm();
    }

    resetForm() {
        this.Name = '';
        this.address = '';
        this.contactPerson = '';
        this.phone = '';
        this.email = '';
        this.paymentTerms = '';
        this.editingSupplierId = null;
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
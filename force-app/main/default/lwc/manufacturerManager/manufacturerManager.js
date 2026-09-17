import { LightningElement, wire } from 'lwc';
import saveManufacturer from '@salesforce/apex/ManufacturerController.saveManufacturer';
import deleteManufacturer from '@salesforce/apex/ManufacturerController.deleteManufacturer';
import getManufacturers from '@salesforce/apex/ManufacturerController.getManufacturers';
import { refreshApex } from '@salesforce/apex';

const ACTIONS = [
    { label: 'Edit', name: 'edit' },
    { label: 'Delete', name: 'delete' }
];

export default class ManufacturerManager extends LightningElement {

    isModalOpen = false;
    recordId = null; // Stores record ID when editing

    manufacturerName = '';
    contactPerson = '';
    phone = '';
    email = '';
    licenseNumber = '';

    wiredManufacturersResult;
    manufacturers;

    columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Contact Person', fieldName: 'Contact_Person__c' },
        { label: 'Phone', fieldName: 'Contact_Phone__c' },
        { label: 'Email', fieldName: 'Contact_Email__c' },
        { label: 'License Number', fieldName: 'License_Number__c' },
        {
            type: 'action',
            typeAttributes: { rowActions: ACTIONS }
        }
    ];

    get modalTitle() {
        return this.recordId ? 'Edit Manufacturer' : 'New Manufacturer';
    }

    @wire(getManufacturers)
    wiredManufacturers(result) {
        this.wiredManufacturersResult = result;

        if (result.data) {
            this.manufacturers = result.data;
        } else if (result.error) {
            console.error('Error fetching manufacturers:', result.error);
        }
    }

    openModal() {
        this.resetForm();
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
        this.resetForm();
    }

    resetForm() {
        this.recordId = null;
        this.manufacturerName = '';
        this.contactPerson = '';
        this.phone = '';
        this.email = '';
        this.licenseNumber = '';
    }

    handleChange(event) {
        this[event.target.name] = event.target.value;
    }

    saveRecord() {
        saveManufacturer({
            recordId: this.recordId,
            name: this.manufacturerName,
            contactPerson: this.contactPerson,
            phone: this.phone,
            email: this.email,
            licenseNumber: this.licenseNumber
        })
        .then(() => {
            this.closeModal();
            return refreshApex(this.wiredManufacturersResult);
        })
        .catch(error => {
            console.error('Error saving manufacturer:', error);
        });
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        if (actionName === 'edit') {
            this.editRecord(row);
        } else if (actionName === 'delete') {
            this.deleteRecord(row.Id);
        }
    }

    editRecord(row) {
        this.recordId = row.Id;
        this.manufacturerName = row.Name || '';
        this.contactPerson = row.Contact_Person__c || '';
        this.phone = row.Contact_Phone__c || '';
        this.email = row.Contact_Email__c || '';
        this.licenseNumber = row.License_Number__c || '';
        this.isModalOpen = true;
    }

    deleteRecord(recordIdToDelete) {
        if (confirm('Are you sure you want to delete this manufacturer?')) {
            deleteManufacturer({ recordId: recordIdToDelete })
                .then(() => {
                    return refreshApex(this.wiredManufacturersResult);
                })
                .catch(error => {
                    console.error('Error deleting record:', error);
                });
        }
    }
}
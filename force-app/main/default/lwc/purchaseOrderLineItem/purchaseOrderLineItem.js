
import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import saveLineItems from '@salesforce/apex/PurchaseOrderDetailController.saveLineItems';


export default class PurchaseOrderLineItem extends LightningElement {

    @api purchaseOrderId;
     connectedCallback() {
        console.log('Purchase Order ID is: ' + this.purchaseOrderId);
    }

        addLineItem(){
            this.items=[
                ...this.items,
                 {key:this.keyCounter++, Product__c: '', Quantity__c: 1, Unit_Price__c: 0}
            ];
        }

    items=[
        {key:0,  Product__c: '', Quantity__c: 1, Unit_Price__c: 0}
    ];
    keyCounter=1;

    get isOnlyOneRow(){
        return this.items.length<=1;
    }

    handleRemoveRow(event){
        const index=parseInt(event.target.dataset.index,10);
        if(this.items.length>1){
            this.items = this.items.filter((_, i) => i !== index);
        }
    }

    handleRowChange(event){
        // debugger;
        const index= parseInt(event.target.dataset.index,10);
        const fieldName=event.target.name;
        const value=fieldName==='product'? event.detail.recordId : event.detail.value;

       const updatedItems=[...this.items];
       if(fieldName==='product'){
            updatedItems[index].Product__c=value;
       }
       else if(fieldName==='quantity'){
        updatedItems[index].Quantity__c=value;
       }
       else if(fieldName==='unitPrice'){
        updatedItems[index].Unit_Price__c=value;
       }
       this.items=updatedItems;
    }

   handleSave() {
    const invalidItems = this.items.some(
        item =>
            !item.Product__c ||
            item.Quantity__c <= 0 ||
            item.Unit_Price__c <= 0
    );

    if (invalidItems) {
        alert(
            'Please fill all required fields and ensure Quantity and Unit Price are greater than zero.'
        );
        return;
    }

    const payload = this.items.map(item => ({
        Product__c: item.Product__c,
        Quantity__c: item.Quantity__c,
        Unit_Price__c: item.Unit_Price__c
    }));
debugger;
    saveLineItems({
        purchaseOrderId: this.purchaseOrderId,
        lineItems: payload
    })
        .then(() => {
            debugger;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Line items saved successfully.',
                    variant: 'success'
                })
            );

            this.dispatchEvent(
                new CustomEvent('saved')
            );
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error Saving Line Items',
                    message: error.body?.message || 'Failed to save items',
                    variant: 'error'
                })
            );
        });
}


    closeModal(){
        this.dispatchEvent(new CustomEvent('close'));
    }
}
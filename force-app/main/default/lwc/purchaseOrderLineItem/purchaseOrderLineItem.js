import { LightningElement, api } from 'lwc';

export default class PurchaseOrderLineItem extends LightningElement {

    @api purchaseOrderId;
     connectedCallback() {
        debugger;
        console.log('Purchase Order ID is: ' + this.purchaseOrderId);
    }

    items=[
        {key:0,  Product__C: '', QuanitiyQuantity__c: 1, Unit_Price__c: 0}
    ];

    closeModal(){
        debugger;
        this.dispatchEvent(new CustomEvent('close'));
    }
}
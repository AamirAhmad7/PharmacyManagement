import { LightningElement, api } from 'lwc';

export default class PurchaseOrderLineItem extends LightningElement {

    @api purchaseOrderId;
     connectedCallback() {
        console.log('Purchase Order ID is: ' + this.purchaseOrderId);
    }

        addLineItem(){
            debugger;
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



    closeModal(){
        this.dispatchEvent(new CustomEvent('close'));
    }
}
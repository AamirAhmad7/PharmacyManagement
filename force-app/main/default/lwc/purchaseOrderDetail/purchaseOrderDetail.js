import { LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import getPurchaseOrders from '@salesforce/apex/PurchaseOrderDetailController.getPurchaseOrders';

export default class PurchaseOrderDetail extends LightningElement {

    recordId;
    wiredResult;
    data;
    isModalOpen=false;

    @wire(CurrentPageReference)
    pageRef(currentPageReference){
        if(currentPageReference?.state?.c__recordId){
            this.recordId=currentPageReference.state.c__recordId;
        }
    }

    @wire(getPurchaseOrders, {recordId: '$recordId'})
    wirePurchaseOrder(result){
        debugger;
        this.wiredResult=result;
        if(result.data){
            this.data=result.data;
        }
            else if(result.error){
                console.log('There is error : '+result.error);
            }

        }

        get supplierName(){
            return this.data?.Supplier__r?this.data.Supplier__r.Name : '';
        }
        handleNewLineItem(){
            this.isModalOpen=true;
        }

        closeModal(){
            this.isModalOpen=false;
        }

    }
    

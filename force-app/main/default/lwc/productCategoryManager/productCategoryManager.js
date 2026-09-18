import { LightningElement, wire } from 'lwc';
import getProductCategories from '@salesforce/apex/ProductCategoryController.getProductCategories';
import saveProductCagegory from '@salesforce/apex/ProductCategoryController.saveProductCagegory';
import { refreshApex } from '@salesforce/apex'; // 1. Import refreshApex
import editProductCategory from '@salesforce/apex/ProductCategoryController.editProductCategory';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import deleteProductCategory from '@salesforce/apex/ProductCategoryController.deleteProductCategory';

export default class productCategoryManager extends LightningElement {

    columns=[
        { label: 'Category Name', fieldName: 'Name' },
        {label: 'Description', fieldName: 'Description__c'},
        {label: 'Category Code', fieldName: 'Category_Code__c'},
        {
            type: 'action',
            typeAttributes:{
                rowActions:[
                    {label: 'Edit', name: 'edit'},
                    {label: 'Delete', name: 'delete'}
                ]
            }
        }
    ]

    categoryName;
    description;
    categoryCode;
    categories;
    wiredResult;
    recordId;

    handleChange(event){
        const field = event.target.name;
        const value = event.target.value;


        if(field==='categoryName'){
            this.categoryName=value;
        } 
        else if(field==='description'){
            this.description=value
        }
        else if(field==='categoryCode'){
            this.categoryCode=value;
        }
    }

    handleRowAction(event){

        const actionName = event.detail.action.name;
        const data = event.detail.row;
        this.recordId=data.Id;

        if(actionName=='edit'){
            this.editAction(data);
        }
        else if (actionName=='delete'){
            this.deleteAction(data);
        }    
         
        
    }

    editAction(data){
        this.recordId=data.Id;
        this.categoryName= data.Name;
        this.description= data.Description__c;
        this.categoryCode = data.Category_Code__c;
        this.isModalOpen=true;
        
    }

    deleteAction(data){
       if(confirm('Are you sure you want to delete category: ', this.categoryName)){
         deleteProductCategory({recordId: data.Id})
         .then(()=>{
            this.showToast(
                'Success',
                    'Category deleted successfully',
                    'success'
            );
            this.resetForm(this.wiredResult);
            this.isModalOpen=false;
            return refreshApex(this.wiredResult);
         })


       }

    }

    @wire(getProductCategories)
    wiredProductCategories(result){
        this.wiredResult=result;
        if(result.data){
            this.categories=result.data;

        }
        else {
            
    console.log('Error in getting Categories: ', result.error);
}
    }

    handleSave(){
        ;
          // 1. Query all lightning-input fields inside the template
    const allValid = [...this.template.querySelectorAll('lightning-input')]
        .reduce((validSoFar, inputFields) => {
            inputFields.reportValidity(); // Displays error messages on required/invalid fields
            return validSoFar && inputFields.checkValidity();
        }, true);

    // 2. Stop execution if any field is invalid or empty
    if (!allValid) {
        return;
    }
        if(!this.recordId){
        saveProductCagegory({
            categoryName: this.categoryName,
            description: this.description,
            categoryCode: this.categoryCode
        })
        .then(()=>{
            this.isModalOpen=false;
            this.resetForm();
            return refreshApex(this.wiredResult);
        })
        .catch(error=>{
            console.error('Error in catch occured: ', error);

        });    
    }

    else if(this.recordId){
        ;
        editProductCategory({
            
            recordId: this.recordId,
            Name: this.categoryName,
            description: this.description,
            categoryCode: this.categoryCode

        })
        .then(()=>{
            this.showToast(
                'success',
                'category updated successfully',
                'success'
            )
            this.resetForm();
            this.isModalOpen=false;
            refreshApex(this.wiredResult);

        })
        .catch();
    }
}
    isModalOpen= false;

    openModal(){
        this.isModalOpen = true;
    }
    closeModal(){
        this.isModalOpen = false;
    }

    showToast(title, message, varient){
    this.dispatchEvent(
        new ShowToastEvent({
            title,
            message,
            varient
        })
    );
}
    
    resetForm(){
        this.categoryName='';
        this.categoryCode='';
        this.description='';
        this.recordId='';
    }
}
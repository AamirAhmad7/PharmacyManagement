import { LightningElement, wire } from 'lwc';
import getProductCategories from '@salesforce/apex/ProductCategoryController.getProductCategories';
import saveProductCagegory from '@salesforce/apex/ProductCategoryController.saveProductCagegory';
import { refreshApex } from '@salesforce/apex'; // 1. Import refreshApex

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
    categoryCode
    categories;
    wiredResult;

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


    @wire(getProductCategories)
    wiredProductCategories(result,a){
        debugger;
        this.wiredResult=result;
        if(result.data){
            this.categories=result.data;

        }
        else {
            
    console.log('Error in getting Categories: ', result.error);
}
    }

    handleSave(){
        
        saveProductCagegory({
            categoryName: this.categoryName,
            description: this.description,
            categoryCode: this.categoryCode
        })
        .then(()=>{
            this.isModalOpen=false;
            this.resetForm();
            return refreshApex(this.wiredResult);
        }
        .catch();
        );
        )
        )
        
    }
    isModalOpen= false;

    openModal(){
        this.isModalOpen = true;
    }
    closeModal(){
        this.isModalOpen = false;
    }
    
    resetForm(){
        this.categoryName='';
        this.categoryCode='';
        this.description='';
    }
}
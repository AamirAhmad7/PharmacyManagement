public with sharing class ProductCategoryController {
    
   @AuraEnabled(cacheable=true)
   public static List<Product_Category__c> getProductCategories(){

    return [
        Select Id, Name, Description__c, Category_Code__c from Product_Category__c 

    ];
    }

    @AuraEnabled
    public static Product_Category__c saveProductCagegory(String categoryName, string description, string categoryCode ){

        Product_Category__c newCategory= new Product_Category__c(

        Name=categoryName,
        Description__c=description,
        Category_Code__c=categoryCode);

        insert newCategory;
        return newCategory;

    }

    @AuraEnabled
    public static void editProductCategory(string recordId, string Name, string description, string categoryCode){
        if(string.isNotBlank(recordId)){
            Product_Category__c obj = [select Id, Name, Description__c, Category_Code__c from Product_Category__c where Id = :recordId ];

            obj.Name = Name;
            obj.Description__c= description;
            obj.Category_Code__c= categoryCode;
            update obj;
        }
        
    }

    @AuraEnabled
    public static void deleteProductCategory(string recordId){
        if(string.isNotBlank(recordId)){
            Product_Category__c obj=[select Id from Product_Category__c where Id = :recordId];
            delete obj;
        }

    }
}
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
}
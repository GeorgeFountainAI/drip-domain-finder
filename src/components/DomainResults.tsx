Completely replace src/components/DomainResults.tsx with a version where:

1. Every domain result shows a visible Buy Now button immediately to the right of the price.  
2. The button always renders (no conditions, no hover effects).  
3. The button uses a gradient style consistent with the site.  
4. The onClick should call handleBuyNow(domain.name).  
5. Remove any duplicate BuyButton components or old conditional logic.  

Then publish the changes, sync to GitHub, and confirm that the Buy Now buttons render in the deployed app.

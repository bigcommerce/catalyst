export function store_pdp_product_in_localstorage(product: any) {
    const productData = {
      brand: product.brand?.name || null, // Use null if brand.name is undefined
      sku: product.sku,
      name: product.name,
      mpn: product.mpn,
    };
    localStorage.setItem('productInfo', JSON.stringify(productData));
}

'use server';
import { ProductFormData } from './../../../product/[slug]/_components/product-form/use-product-form';
import { ProductFormFragment } from './../../../product/[slug]/_components/product-form/fragment';
import { FragmentOf, graphql } from '~/client/graphql';
import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cookies } from 'next/headers';
import { getSessionUserDetails } from '~/auth';
import { findCustomerDetails } from '../../_actions/find-customer';


type CartSelectedOptionsInput = ReturnType<typeof graphql.scalar<'CartSelectedOptionsInput'>>;


export const customerInfo = async () => {
  const getCustomerData = await getSessionUserDetails();
console.log(getCustomerData,"customer");
  let response = null;
    if (getCustomerData?.user?.email) {
      response = await findCustomerDetails({
        first_name: '',
        last_name: '',
        email: getCustomerData?.user?.email,
      });
    }
    console.log(response?.data?.output, "Output Data");
    const responseData = {
      id: response?.data?.output?.length > 0 ? response?.data?.output[0]?.id : 0,
      email: response?.data?.output?.length > 0 ? response?.data?.output[0]?.email : '',
      first_name: response?.data?.output?.length > 0 ? response?.data?.output[0]?.first_name : '',
      last_name: response?.data?.output?.length > 0 ? response?.data?.output[0]?.last_name : '',
      customer_group_id: response?.data?.output?.length > 0 ? response?.data?.output[0]?.customer_group_id : 0,
    };

    return responseData;

}

export const handleRequestQuote = async ( data: ProductFormData,
    product: FragmentOf<typeof ProductFormFragment>) => {

    const productEntityId = Number(data.product_id);
    const quantity = Number(data.quantity);
    const cookieStore = await cookies();
    
      const selectedOptions = removeEdgesAndNodes(
        product.productOptions,
      ).reduce<CartSelectedOptionsInput>((accum, option) => {
        const optionValueEntityId = data[`attribute_${option.entityId}`];

        let multipleChoicesOptionInput;
        let checkboxOptionInput;
        let numberFieldOptionInput;
        let textFieldOptionInput;
        let multiLineTextFieldOptionInput;
        let dateFieldOptionInput;
    
        if (optionValueEntityId === '') return accum;
        switch (option.__typename) {
          case 'MultipleChoiceOption':
            multipleChoicesOptionInput = {
              optionEntityId: option.entityId,
              optionValueEntityId: Number(optionValueEntityId),   
              optionLabelName : option.values.edges?.find(
                (valueItem) => valueItem.node.entityId == optionValueEntityId
              )?.node.label || null,
            }          
    
            if (accum.multipleChoices) {
              return {
                ...accum,
                multipleChoices: [...accum.multipleChoices, multipleChoicesOptionInput],
              };
            }
    
            return { ...accum, multipleChoices: [multipleChoicesOptionInput]};
    
          case 'CheckboxOption':
            checkboxOptionInput = {
              optionEntityId: option.entityId,
              optionLabel: option?.label,
              optionValueEntityId:
                Number(optionValueEntityId) !== 0
                  ? option.checkedOptionValueEntityId
                  : option.uncheckedOptionValueEntityId,
            };
    
            if (accum.checkboxes) {
              return { ...accum, checkboxes: [...accum.checkboxes, checkboxOptionInput] };
            }
    
            return { ...accum, checkboxes: [checkboxOptionInput] };
    
          case 'NumberFieldOption':
            numberFieldOptionInput = {
              optionEntityId: option.entityId,
              number: Number(optionValueEntityId),
            };
    
            if (accum.numberFields) {
              return { ...accum, numberFields: [...accum.numberFields, numberFieldOptionInput] };
            }
    
            return { ...accum, numberFields: [numberFieldOptionInput] };
    
          case 'TextFieldOption':
            textFieldOptionInput = {
              optionEntityId: option.entityId,
              text: String(optionValueEntityId),
            };
    
            if (accum.textFields) {
              return {
                ...accum,
                textFields: [...accum.textFields, textFieldOptionInput],
              };
            }
    
            return { ...accum, textFields: [textFieldOptionInput] };
    
          case 'MultiLineTextFieldOption':
            multiLineTextFieldOptionInput = {
              optionEntityId: option.entityId,
              text: String(optionValueEntityId),
            };
    
            if (accum.multiLineTextFields) {
              return {
                ...accum,
                multiLineTextFields: [...accum.multiLineTextFields, multiLineTextFieldOptionInput],
              };
            }
    
            return { ...accum, multiLineTextFields: [multiLineTextFieldOptionInput] };
    
          case 'DateFieldOption':
            dateFieldOptionInput = {
              optionEntityId: option.entityId,
              date: new Date(String(optionValueEntityId)).toISOString(),
            };
    
            if (accum.dateFields) {
              return {
                ...accum,
                dateFields: [...accum.dateFields, dateFieldOptionInput],
              };
            }
    
            return { ...accum, dateFields: [dateFieldOptionInput] };
        }
    
        return accum;
      }, {});




      try {        

       const variantSku = product?.variants?.edges?.find((Item)=>Item?.node?.sku === product.sku);

      const productSelectedOpt = selectedOptions.multipleChoices
  ?.map(option => {
    if (Array.isArray(product.productOptions.edges)) {

      const optionFromProduct = product.productOptions.edges.find((prodOption: any) => 
        prodOption.node.entityId === option.optionEntityId
      );


      if (optionFromProduct) {
        const selectedValue = optionFromProduct?.node?.values?.edges.find((valueItem: any) => 
          valueItem.node.entityId === option.optionValueEntityId
        );

        if (selectedValue) {
          const isVariant = optionFromProduct.node.isVariantOption ?? false; 

          if (isVariant) {
            return { type: "variant", label: selectedValue.node.label };
          } else {
            return { type: "modifier", label: selectedValue.node.label,modifierId:optionFromProduct.node.entityId, modifierOptionId: selectedValue.node.entityId}; 
          }
        }
      }
    }
    return undefined;
  }).filter(Boolean);

const variantLabels = productSelectedOpt?.filter(item => item?.type === "variant").map(item => item?.label).join(", ");
const prodModifierId = productSelectedOpt?.filter(item => item?.type === "modifier").map(item => item?.modifierId).join(", ");
const prodModifierOptionId = productSelectedOpt?.filter(item => item?.type === "modifier").map(item => item?.modifierOptionId).join(", ");
const prodModifierOptionLabel = productSelectedOpt?.filter(item => item?.type === "modifier").map(item => item?.label).join(", ");




       const cInfo = await customerInfo();
        const reqQuoteItems = {
              qr_customer: cInfo,
              qr_product:{
                bc_product_id:productEntityId,
                bc_sku: product.sku,
                bc_product_name:product.name,
                bc_variant_id:variantSku?.node?.entityId,
                bc_variant_sku:variantSku?.node?.sku,
                bc_variant_name:variantLabels,
                bc_modifier_id:prodModifierId,
                bc_modifier_option:prodModifierOptionId,
                bc_modifier_option_name:prodModifierOptionLabel,
                selectedOptions:selectedOptions,
                productInfo:product,
              }
            }

          cookieStore.set({
            name: 'RequestQuote',
            value: JSON.stringify(reqQuoteItems?.qr_product?.bc_product_id), 
            httpOnly: true,
            sameSite: 'lax',
            secure: true,
            path: '/',
          });
      
          return { status: 'success', data: reqQuoteItems};
        }
         catch (error: unknown) {
          if (error instanceof Error) {
            console.error('Error occurred:', error);
            return { status: 'error', error: error.message };
          }
          return { status: 'error', error: 'Something went wrong. Please try again.' };
        }
      }
  


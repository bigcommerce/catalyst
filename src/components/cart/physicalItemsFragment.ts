export const physicalItemsFragment = {
  fragment: `fragment physicalItem on CartPhysicalItem {
		entityId
		parentEntityId
		variantEntityId
		productEntityId
		sku
		name
		url
		imageUrl
		brand
		quantity
		isTaxable
		discounts {
		  entityId
		  discountedAmount {
			currencyCode
			value
		  }
		}
		discountedAmount {
		  currencyCode
		  value
		}
		couponAmount {
		  currencyCode
		  value
		}
		listPrice {
		  currencyCode
		  value
		}
		originalPrice {
		  currencyCode
		  value
		}
		salePrice {
		  currencyCode
		  value
		}
		extendedListPrice {
		  currencyCode
		  value
		}
		extendedSalePrice {
		  currencyCode
		  value
		}
		isShippingRequired
		selectedOptions {
		  entityId
		  name
		  ... on CartSelectedCheckboxOption {
			value
			valueEntityId
		  }
		  ... on CartSelectedDateFieldOption {
			date {
			  utc
			}
		  }
		  ... on CartSelectedFileUploadOption {
			fileName
		  }
		  ... on CartSelectedMultiLineTextFieldOption {
			text
		  }
		  ... on CartSelectedMultipleChoiceOption {
			value
			valueEntityId
		  }
		  ... on CartSelectedNumberFieldOption {
			number
		  }
		  ... on CartSelectedTextFieldOption {
			text
		  }
		}
		giftWrapping {
		  name
		  amount {
			currencyCode
			value
		  }
		  message
		}
	  }`,
  fragmentName: 'physicalItem',
};

import { AlertCircle, Check, Minus, Plus, Loader2 as Spinner } from "lucide-react";
import { useState } from "react";
import { UpdateCartLineItems } from "../management-apis";
import { useCommonContext } from '~/components/common-context/common-provider';
import { useCart } from '~/components/header/cart-provider';
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { Link } from '~/components/link';
import { getCartData } from "../get-cart-items";

export const InputPlusMinus = ({product, productData, isLoading, setIsLoading}: {product:string, productData: any, isLoading: boolean, setIsLoading: (loading: boolean) => void}) => {
  const [quantity, setQuantity] = useState<number>(productData?.quantity || 1);
  const [loader, setLoader] = useState<Boolean>(false);
  const productFlyout = useCommonContext();
  let cartItemsData = productFlyout.cartData;
  const cart = useCart();
  const t = useTranslations('Components.ProductCard.AddToCart');

  const changeInput = async (param: any) => {
    let quanty = quantity
    if (param == 'minus') {
      quanty = quantity - 1;
      if (quanty <= 0) {
        quanty = 1;
      }
      setQuantity(quanty);
    } else {
      quanty = quantity + 1;
      setQuantity(quanty);
    }
    if(product == "true") {
      setLoader(true);
      setIsLoading(true);
      let postData = {line_item:{
        product_id : productFlyout?.productData?.productEntityId,
        quantity: quanty,
        variant_id: productFlyout?.productData?.variantEntityId
      }};
      let status = await UpdateCartLineItems(cartItemsData?.entityId, productFlyout?.productData?.entityId, postData);
      let cartData: any = await getCartData(cartItemsData?.entityId);
      cart.setCount(cartData?.data?.lineItems?.totalQuantity);
      productFlyout.setCartDataFn(cartData?.data);
      if (status?.error) {
        toast.error(t('error'), {
          icon: <AlertCircle className="text-error-secondary" />,
        });
      } else {
        toast.success(
          () => (
            <div className="flex items-center gap-3">
              <span>
                {t.rich('update', {
                  cartLink: (chunks: any) => (
                    <Link
                      className="font-semibold text-primary"
                      href="/cart"
                      prefetch="viewport"
                      prefetchKind="full"
                    >
                      {chunks}
                    </Link>
                  ),
                })}
              </span>
            </div>
          ),
          { icon: <Check className="text-success-secondary" /> },
        );
      }
      setLoader(false);
      setIsLoading(false);
    }
  };

  return(
    <>
    <div className="relative w-max input-plus-minus-container">
      {/* {loader && <Spinner aria-hidden="true" className="animate-spin text-blue-600 absolute top-[23%] left-[38.1%] "></Spinner>} */}
      <div className="text-[14px] font-normal tracking-[0.25px] text-[#353535]">
        <div className="flex h-[44px] max-w-[105px] items-center justify-center gap-[10px] rounded-[20px] border border-[#d6d6d6]">
          <div className="cursor-pointer">
            <Minus
              onClick={() => changeInput('minus')}
              className="h-[1rem] w-[1rem] text-[#7F7F7F]"
            ></Minus>
          </div>
          <input
            name="quantity"
            type="number"
            readOnly
            className="[&::-webkit-outer-spin-button]:margin-0 [&::-webkit-inner-spin-button]:margin-0 w-[35%] bg-transparent border border-y-0 text-center focus:border-y-0 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            min="1"
            value={quantity}
          />
          <div className="cursor-pointer">
            <Plus
              onClick={() => changeInput('plus')}
              className="h-[1rem] w-[1rem] text-[#7F7F7F]"
            ></Plus>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}


import { LocaleType } from '~/i18n';
import { cookies } from 'next/headers';
import { OrderMessage } from './_components/OrderMessage';
import { OrderSummaryTitle } from './_components/OrderSummaryTitle';
import { OrderCustomerInfo } from './_components/OrderCustomerInfo';

interface ProductPageProps {
  params: { slug: string; locale: LocaleType };
  searchParams: Record<string, string | string[] | undefined>;
}


function getOptionValueIds({ searchParams }: { searchParams: ProductPageProps['searchParams'] }) {
  const { slug, ...options } = searchParams;

  console.log('searchParams', searchParams);

  return Object.keys(options)
    .map((option) => ({
      optionEntityId: Number(option),
      valueEntityId: Number(searchParams[option]),
    }))
    .filter(
      (option) => !Number.isNaN(option.optionEntityId) && !Number.isNaN(option.valueEntityId),
    );
}


export default function OrderConfirmation({ params, searchParams }: ProductPageProps) {
//export default function OrderConfirmation() {
  const optionValueIds = getOptionValueIds({ searchParams });
  
  console.log('----options----', optionValueIds);
  console.log('----params----', params);
  console.log('---searchParams-----', searchParams);

  const data = cookies().get('orderDetails')?.value;
  if(data){
    console.log(data);
    let dataJson = JSON.parse(data);
    console.log(dataJson);
    console.log(dataJson.orderDetails.orderId)
    console.log(dataJson.orderDetails.customerName)
  
  
    //let ema: string = "mithranbalaji@arizon.digital";
    return (
      <div> Order Confirmation{data} 
      <OrderMessage email={dataJson?.orderDetails?.customerName} />
      <OrderSummaryTitle />
      {/* <OrderCustomerInfo order={order}/> */}
      </div>
    );
  }

  // return (
  //     <div>Order Confirmation{orderDetails}</div>
  // );
}
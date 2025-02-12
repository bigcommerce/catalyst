'use client';
import React, { useEffect, useState } from 'react';
import { Input } from '../Input';
import { useRouter } from 'next/navigation';
import { updateProductPrice } from '../../_actions/update-price';
import Spinner from './Spinner';
import { useCompareDrawerContext } from '~/components/ui/compare-drawer';

interface ProductPriceAdjusterProps {
  parentSku: string;
  sku: string;
  oem_sku: string;
  productPrice: number;
  initialCost: number;
  initialFloor: number;
  initialMarkup: number;
  productId: number;
  cartId: any;
  ProductType: string;
  accessoriesData: any[];
  quantity: number;
}

const EditIcon = () => {
  return (
    <svg width="19" height="14" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1.7028 17.9723C1.3528 18.0556 1.04864 17.9681 0.790302 17.7098C0.531969 17.4515 0.444469 17.1473 0.527802 16.7973L1.5278 12.0223L6.4778 16.9723L1.7028 17.9723ZM6.4778 16.9723L1.5278 12.0223L12.9778 0.572314C13.3611 0.188981 13.8361 -0.00268555 14.4028 -0.00268555C14.9695 -0.00268555 15.4445 0.188981 15.8278 0.572314L17.9278 2.67231C18.3111 3.05565 18.5028 3.53065 18.5028 4.09731C18.5028 4.66398 18.3111 5.13898 17.9278 5.52231L6.4778 16.9723ZM14.4028 1.97231L4.0528 12.3223L6.1778 14.4473L16.5278 4.09731L14.4028 1.97231Z"
        fill="white"
      />
    </svg>
  );
};

const PriceEditor = ({
  isEditing,
  setIsEditing,
  newCost,
  handleCostChange,
  errorMessage,
  handleSubmit,
  loading,
  agentRole,
  initialCost,
  initialFloor
}) => {
  return isEditing ? (
    <>
      <Input
        type="text"
        value={newCost}
        style={{ color: 'black' }}
        onChange={handleCostChange}
        className="text-black-700 mb-4 w-full rounded border-none bg-[#FFFFFF] p-2"
        placeholder="$0.00"
      />
      {errorMessage && <div className="m-2 text-center text-red-500">{errorMessage}</div>}

      <div className="mt-[10px] flex items-center justify-center">
        <button
          onClick={() => setIsEditing(false)}
          className="mb-2 mr-2 w-full rounded bg-white px-4 py-2 text-black"
        >
          Cancel
        </button>
        <button
          className="relative mb-2 w-full rounded bg-[#1DB14B] px-4 py-2 text-white"
          onClick={handleSubmit}
          disabled={
            (agentRole === 'agent' || agentRole === null) &&
            parseFloat(newCost) < initialCost * initialFloor
          }
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner />
            </div>
          )}
          <span>Save</span>
        </button>
      </div>
    </>
  ) : (
    <button
      onClick={() => setIsEditing(true)}
      className="h-[42px] w-full rounded-sm bg-[#1DB14B] px-[10px] py-[5px]"
    >
      <div className="flex items-center justify-center">
        <EditIcon />
        <span className="items-center text-[14px] font-medium leading-[32px] tracking-[1.25px]">
          ADJUST PRICE
        </span>
      </div>
    </button>
  );
};

const ProductInfoRow = ({ label, value }: { label: string; value: string | number }) => {
  const valueString = String(value);
  const isLongValue = valueString.length > 15;

  return (
    <div
      className={`${isLongValue ? 'grid grid-cols-1' : 'grid grid-cols-2'} items-center border-b border-[#cccbcb] py-1`}
    >
      <p className="break-words text-sm font-bold tracking-wide">{label}</p>
      <p
        className={`text-sm font-normal tracking-wide ${isLongValue ? 'mt-1 text-right' : 'text-right'}`}
      >
        {valueString}
      </p>
    </div>
  );
};

const ProductPriceAdjuster: React.FC<ProductPriceAdjusterProps> = ({
  parentSku,
  sku,
  oem_sku,
  productPrice,
  initialCost,
  initialFloor,
  initialMarkup,
  productId,
  cartId,
  ProductType,
  quantity,
  accessoriesData
}) => {
  const [isEditingParent, setIsEditingParent] = useState<boolean>(false);
  const [isEditingAccessory, setIsEditingAccessory] = useState<number | null>(null);
  const [newCost, setNewCost] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { agentRole } = useCompareDrawerContext();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isEditingParent && isEditingAccessory === null) {
      setNewCost('');
      setErrorMessage(null);
    }
  }, [isEditingParent, isEditingAccessory]);

  const handleSubmit = async (isAccessory: boolean = false, accessoryIndex: number = -1) => {
    const numericValue = parseFloat(newCost);
    if (newCost.length > 6) {
      setErrorMessage('Price cannot be more than 6 digits');
      return;
    }
    if (newCost.trim() === '') {
      setErrorMessage('Price cannot be empty');
      return;
    } else if (numericValue == 0) {
      setErrorMessage('Price cannot be 0');
      return;
    }

    const currentCost = isAccessory
      ? accessoriesData[accessoryIndex]?.originalPrice?.value
      : initialCost;
    const floorPrice = currentCost * initialFloor;

    if ((agentRole === 'agent' || agentRole === null) && numericValue < floorPrice) {
      setErrorMessage('Price cannot be less than floor price');
      return;
    }

    try {
      setLoading(true);
      const currentSku = isAccessory ? accessoriesData[accessoryIndex].sku : sku;
      const CheckProductID = isAccessory ? accessoriesData[accessoryIndex].productEntityId : productId
      const res = await updateProductPrice(numericValue, cartId, CheckProductID, ProductType, currentSku);

      if (res.status === 200) {
        setNewCost('');
        if (isAccessory) {
          setIsEditingAccessory(null);
        } else {
          setIsEditingParent(false);
        }
        router.refresh();
      } else {
        setErrorMessage(res.error || 'Failed to update price');
      }
    } catch (error) {
      setErrorMessage('An error occurred while updating the price');
    } finally {
      setLoading(false);
    }
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setNewCost(value);
      setErrorMessage(null);
    }
  };

  return (
    <div className="w-full bg-[#353535] p-[10px] text-white">
      {/* Parent Product Section */}
      <div className="">
        <ProductInfoRow label="PARENT SKU" value={parentSku} />
        <ProductInfoRow label="SKU" value={sku} />
        <ProductInfoRow label="OEM SKU" value={oem_sku} />
        <ProductInfoRow label="Cost" value={initialCost || '0000.00'} />
        <ProductInfoRow
          label="Floor ($)"
          value={initialFloor ? initialCost * initialFloor : '0000.00'}
        />
        <ProductInfoRow
          label="Markup"
          value={initialCost ? (productPrice / initialCost).toFixed(2) : '0000.00'}
        />
        <ProductInfoRow label="Floor Markup" value={initialFloor || '00'} />

        <PriceEditor
          isEditing={isEditingParent}
          setIsEditing={setIsEditingParent}
          newCost={newCost}
          handleCostChange={handleCostChange}
          errorMessage={errorMessage}
          handleSubmit={() => handleSubmit(false)}
          loading={loading}
          agentRole={agentRole}
          initialCost={initialCost}
          initialFloor={initialFloor}
        />
      </div>
      {accessoriesData?.length > 0 && 
      
      <div>
        {/* Accessories Section */}
        {accessoriesData && accessoriesData.length > 0 && (
          <div className="">
            {accessoriesData.map((accessory, index) => (
              <div key={index} className=" border-[#cccbcb]">
                <ProductInfoRow label="ACCESSORY SKU" value={accessory.sku} />
                <ProductInfoRow label="Cost" value={accessory?.originalPrice?.value || '0000.00'} />
                <ProductInfoRow
                  label="Floor ($)"
                  value={
                    initialFloor
                      ? (accessory?.originalPrice?.value * initialFloor).toFixed(2)
                      : '0000.00'
                  }
                />
                <ProductInfoRow label="Floor Markup" value={initialFloor || '00'} />

                <PriceEditor
                  isEditing={isEditingAccessory === index}
                  setIsEditing={(value) => setIsEditingAccessory(value ? index : null)}
                  newCost={newCost}
                  handleCostChange={handleCostChange}
                  errorMessage={errorMessage}
                  handleSubmit={() => handleSubmit(true, index)}
                  loading={loading}
                  agentRole={agentRole}
                  initialCost={accessory?.originalPrice?.value}
                  initialFloor={initialFloor}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      }
    </div>
  );
};

export default ProductPriceAdjuster;
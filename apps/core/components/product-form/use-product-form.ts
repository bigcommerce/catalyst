import { useController, UseControllerProps, useForm, useFormContext } from 'react-hook-form';

export interface ProductFormData extends Record<string, string | number | undefined> {
  product_id: string;
  quantity: number;
}

export const useProductForm = () => useForm<ProductFormData>();

export const useProductFieldController = (props: UseControllerProps<ProductFormData>) => {
  const context = useFormContext<ProductFormData>();

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!context) {
    throw new Error('useProductFieldController must be used within a FormProvider');
  }

  return useController({
    control: context.control,
    ...props,
  });
};

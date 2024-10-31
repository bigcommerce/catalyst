'use client'

import { useState } from 'react'

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { clsx } from 'clsx'

import { Button } from '@/vibes/soul/primitives/button'
import { Checkbox } from '@/vibes/soul/primitives/checkbox'
import { Dropdown } from '@/vibes/soul/primitives/dropdown'
import { Input } from '@/vibes/soul/primitives/input'
import { Label } from '@/vibes/soul/primitives/label'
import { TextArea } from '@/vibes/soul/primitives/textarea'

const shippingMethods = [
  {
    id: '1',
    label: 'Free Shipping',
    cost: '$0.00',
  },
  {
    id: '2',
    label: 'Expidited Shipping',
    cost: '$10.00',
  },
]
interface Props {
  includeSameAsBillingAddress?: boolean
  includeShippingMethod?: boolean
  includeOrderComments?: boolean
  onSubmit?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export const CheckoutForm = function CheckoutForm({
  includeSameAsBillingAddress,
  includeShippingMethod,
  includeOrderComments,
  onSubmit,
}: Props) {
  const [useSameAddress, setUseSameAddress] = useState(true)
  const [shippingMethod, setShippingMethod] = useState<string | null>()
  return (
    <form className="grid w-full grid-cols-1 gap-5 @sm:grid-cols-2">
      <Input type="text" label="First Name" required />
      <Input type="text" label="Last Name" required />
      <Input type="text" label="Company Name" />
      {/* TODO: Phone number input */}
      <Input type="text" label="Phone Number" />
      <Input type="text" label="Address" required />
      <Input type="text" label="Apartment/Suite/Building" />
      <Input type="text" label="City" required />

      <Dropdown label="Country" labelOnTop items={['USA', 'England', 'Brazil']} required />
      <Dropdown
        label="State/Provence"
        labelOnTop
        items={['Alabama', 'California', 'Georgia', 'Florida', 'Texas']}
        required
      />
      <Input type="text" label="ZIP/Postcode" required />

      {includeSameAsBillingAddress === true && (
        <Checkbox
          className="@sm:col-span-2"
          checked={useSameAddress}
          setChecked={setUseSameAddress}
          label="My billing address is the same as my shipping address."
        />
      )}

      {includeShippingMethod === true && (
        <div className="mt-2 @sm:col-span-2">
          <Label className="text-foreground">Shipping Method</Label>
          <RadioGroupPrimitive.Root className="mt-2 flex flex-col gap-2">
            {shippingMethods.map((option, index) => (
              <RadioGroupPrimitive.Item
                key={index}
                value={option.id}
                onClick={() => setShippingMethod(option.id)}
                className={clsx(
                  'flex w-full items-center justify-between rounded-lg border p-4 text-sm font-medium transition-colors duration-300',
                  'ring-primary focus-visible:outline-0 focus-visible:ring-2',
                  option.id === shippingMethod
                    ? 'bg-foreground text-background'
                    : 'bg-contrast-100 hover:bg-contrast-200'
                )}
              >
                <span>{option.label}</span>
                <span>{option.cost}</span>
              </RadioGroupPrimitive.Item>
            ))}
          </RadioGroupPrimitive.Root>
        </div>
      )}

      {includeOrderComments === true && (
        <TextArea label="Order Comments" className="mt-2 @sm:col-span-2" />
      )}

      {/* TODO: disbale until form is complete */}
      <Button variant="secondary" className="ml-auto @sm:col-span-2" onClick={e => onSubmit?.(e)}>
        Continue
      </Button>
    </form>
  )
}

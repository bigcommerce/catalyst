'use client';

const klaviyoFormId = process.env.NEXT_PUBLIC_KLAVIYO_FORM_ID;

export function KlaviyoForm() {
  return <div className={`klaviyo-form-${klaviyoFormId}`} />;
}
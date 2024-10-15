import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { imageManagerImageUrl } from '~/lib/store-assets';

export interface IconProps {
    'logo'?: string | StaticImport | any;
    'email'?: string | StaticImport | any;
    'fb'?: string | StaticImport | any;
    'google'?: string | StaticImport | any;
    'apple'?: string | StaticImport | any;
}

export const imageIconList: IconProps = {
    'logo': imageManagerImageUrl('site-logo.png', '150w'),
    'email': imageManagerImageUrl('emailicon.png', '16w'),
    'fb': imageManagerImageUrl('facebook.png', '16w'),
    'google': imageManagerImageUrl('google-logo.png', '23w'),
    'apple': imageManagerImageUrl('apple-logo.png', '24w')
};
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { imageManagerImageUrl } from '~/lib/store-assets';

export interface IconProps {
    'logo'?: string | StaticImport | any;
    'homeLogo'?: string | StaticImport | any;
    'email'?: string | StaticImport | any;
    'facebookLogo'?: string | StaticImport | any;
    'google'?: string | StaticImport | any;
    'appleLogo'?: string | StaticImport | any;
    'check-circle'?: string | StaticImport | any;
    'person'?: string | StaticImport | any;
    'closeIcon'?: string | StaticImport | any;
    'fan1'?: string | StaticImport | any;
    'fan2'?: string | StaticImport | any;
    'passwordHide'?: string | StaticImport | any;
}

export const imageIconList: IconProps = {
    'logo': imageManagerImageUrl('site-logo.png', '150w'),
    'homeLogo': imageManagerImageUrl('logo-mark.png', '150w'),
    'email': imageManagerImageUrl('emailicon.png', '16w'),
    'facebookLogo': imageManagerImageUrl('facebook-blue.png', '16w'),
    'google': imageManagerImageUrl('google-logo.png', '23w'),
    'appleLogo': imageManagerImageUrl('apple-black.png','24w'),
    'check-circle': imageManagerImageUrl('check-circle.png', '20w'),
    'person': imageManagerImageUrl('person.png', '16w'),
    'closeIcon': imageManagerImageUrl('close.png', '14w'),
    'fan1': imageManagerImageUrl('image-2-.png', '150w'),
    'fan2': imageManagerImageUrl('add-to-cart-pop-up-img1.jpg', '150w'),
    'passwordHide' : imageManagerImageUrl('eye-password-hide.png', '150w'),
};
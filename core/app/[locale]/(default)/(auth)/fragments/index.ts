import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { imageManagerImageUrl } from '~/lib/store-assets';

export interface IconProps {
    'logo'?: string | StaticImport | any;
    'email'?: string | StaticImport | any;
    'facebookLogo'?: string | StaticImport | any;
    'google'?: string | StaticImport | any;
    'appleLogo'?: string | StaticImport | any;
    'check-circle'?: string | StaticImport | any;
    'person'?: string | StaticImport | any;
    'luna-warehouse'?: string | StaticImport | any;
    'patjoheat-and-shade'?: string | StaticImport | any;
    '1stop-lightning'?: string | StaticImport | any;
    'bailey-street'?: string | StaticImport | any;
    'canada-lightning'?: string | StaticImport | any;
    'homeclick-black'?: string | StaticImport | any;
    'closeIcon'?: string | StaticImport | any;
    'fan1'?: string | StaticImport | any;
    'fan2'?: string | StaticImport | any;
    

}

export const imageIconList: IconProps = {
    'logo': imageManagerImageUrl('site-logo.png', '150w'),
    'email': imageManagerImageUrl('emailicon.png', '16w'),
    'facebookLogo': imageManagerImageUrl('facebook-blue.png', '16w'),
    'google': imageManagerImageUrl('google-logo.png', '23w'),
    'appleLogo': imageManagerImageUrl('apple-black.png','24w'),
    'check-circle': imageManagerImageUrl('check-circle.png', '20w'),
    'person': imageManagerImageUrl('person.png', '16w'),
    'luna-warehouse': imageManagerImageUrl('luna-warehouse.png', '298w'),
    'patjoheat-and-shade': imageManagerImageUrl('patjoheat-and-shade.png', '95w'),
    '1stop-lightning': imageManagerImageUrl('1stop-lightning.png', '194w'),
    'bailey-street': imageManagerImageUrl('bailey-street.png', '138w'),
    'canada-lightning': imageManagerImageUrl('canada-lightning.png', '228w'),
    'homeclick-black': imageManagerImageUrl('homeclick-black.png', '150w'),
    'closeIcon': imageManagerImageUrl('close.png', '14w'),
    'fan1': imageManagerImageUrl('image-2-.png', '150w'),
    'fan2': imageManagerImageUrl('add-to-cart-pop-up-img1.jpg', '150w'),
};
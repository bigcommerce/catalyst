import { auth } from '~/auth';
import B2bAuth from './auth';

export default async function index() {
  const session = await auth()
  const environment = process.env.NODE_ENV
  return (
    <>
        {
            environment !== 'production' ? (
                <>
                    <script>
                    {
                        `
                        window.B3 = {
                            setting: {
                                store_hash: '${process.env.BIGCOMMERCE_STORE_HASH}',
                                channel_id: ${process.env.BIGCOMMERCE_CHANNEL_ID},
                                platform: 'catalyst',
                            }
                        }
                        `
                    }
                    </script>
                    <script
                    type="module"
                    data-storehash="glzvoziq5k"
                    data-channelid="1664810"
                    src="http://localhost:3001/src/main.ts"
                    ></script>
                </>
            ) : (
                <>
                <script>
                    {
                   `
                   window.b3CheckoutConfig = {
                        routes: {
                        dashboard: '/account.php?action=order_status',
                        },
                    }
                    window.B3 = {
                        setting: {
                        store_hash: '${process.env.BIGCOMMERCE_STORE_HASH}',  
                        channel_id: ${process.env.BIGCOMMERCE_CHANNEL_ID},
                        platform: 'catalyst',
                        },
                        'dom.checkoutRegisterParentElement': '#checkout-app',
                        'dom.registerElement':
                        '[href^="/login.php"], #checkout-customer-login, [href="/login.php"] .navUser-item-loginLabel, #checkout-customer-returning .form-legend-container [href="#"]',
                        'dom.openB3Checkout': 'checkout-customer-continue',
                        before_login_goto_page: '/account.php?action=order_status',
                        checkout_super_clear_session: 'true',
                        'dom.navUserLoginElement': '.navUser-item.navUser-item--account',
                    }`
                    }
                </script>
                <script
                type="module"
                crossorigin=""
                src={`${process.env.B2B_BUYER_PORTAL_HOST}/index.*.js`}
                ></script>
                <script
                nomodule=""
                crossorigin=""
                src={`${process.env.B2B_BUYER_PORTAL_HOST}/polyfills-legacy.*.js`}
                ></script>
                <script
                nomodule=""
                crossorigin=""
                src={`${process.env.B2B_BUYER_PORTAL_HOST}/index-legacy.*.js`}
                ></script>
                </>
            )
        }
        <B2bAuth b2bToken={session?.b2bToken ?? ''} />
    </>
  )
}

index.displayName = 'B2B'
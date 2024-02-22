import { BookUser, Eye, Gift, Mail, Package, Settings } from 'lucide-react';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

import { auth } from '~/auth';
import { Link } from '~/components/link';

interface AccountItem {
  children: ReactNode;
  description?: string;
  href: string;
  title: string;
}

const AccountItem = ({ children, title, description, href }: AccountItem) => {
  return (
    <Link
      className="flex items-center border border-gray-200 p-6 focus:outline-none focus:ring-4 focus:ring-blue-primary/20"
      href={href}
    >
      {children}
      <span>
        <h3 className="text-xl font-bold lg:text-2xl">{title}</h3>
        {description ? <p>{description}</p> : null}
      </span>
    </Link>
  );
};

export default async function AccountPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="mx-auto max-w-screen-xl">
      <h1 className="my-6 my-8 text-4xl font-black lg:my-8 lg:text-5xl">My Account</h1>

      <div className="mb-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AccountItem href="/account/orders" title="Orders">
          <Package className="me-8" height={48} width={48} />
        </AccountItem>
        <AccountItem href="/account/messages" title="Messages">
          <Mail className="me-8" height={48} width={48} />
        </AccountItem>
        <AccountItem href="/account/addresses" title="Addresses">
          <BookUser className="me-8" height={48} width={48} />
        </AccountItem>
        <AccountItem href="/account/wishlists" title="Wish lists">
          <Gift className="me-8" height={48} width={48} />
        </AccountItem>
        <AccountItem href="/account/recently-viewed" title="Recently viewed">
          <Eye className="me-8" height={48} width={48} />
        </AccountItem>
        <AccountItem href="/account/settings" title="Account settings">
          <Settings className="me-8" height={48} width={48} />
        </AccountItem>
      </div>
    </div>
  );
}

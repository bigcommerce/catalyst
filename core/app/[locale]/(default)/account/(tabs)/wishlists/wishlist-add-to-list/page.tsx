import { getWishlists } from '../page-data';
import WishlistAddToList from './wishlist-add-to-list';

export default async function WishlistAddToListPage() {
  const data = await getWishlists({
    cursor: null,
    limit: 50,
  });

  if (!data?.wishlists) return <div>No wishlists found.</div>;

  return (
    <div className="w-full">
      <WishlistAddToList wishlists={data.wishlists} hasPreviousPage={false} />
    </div>
  );
}

import { getWishlists } from '../page-data';
import WishlistAddToList from './wishlist-add-to-list';

export default async function WishlistAddToListPage() {
  const data = await getWishlists({
    cursor: null,
    limit: 50,
  });

  if (!data?.wishlists) return null;

  const mappedWishlists = data.wishlists.map((wishlist) => ({
    entityId: wishlist.entityId,
    name: wishlist.name,
    items: wishlist.items.map((item) => ({
      entityId: item.entityId,
      product: {
        ...item.product,
        reviewCount: 0,
        brand: item.product.brand || undefined,
        rating: item.product.rating || undefined,
      },
    })),
  }));

  return (
    <div className="w-full">
      <WishlistAddToList wishlists={mappedWishlists} hasPreviousPage={false} />
    </div>
  );
}

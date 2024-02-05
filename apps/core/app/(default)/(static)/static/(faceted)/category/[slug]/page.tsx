import CategoryPageContents from '~/app/(default)/(dynamic)/(faceted)/category/[slug]/_pageContents';
import { CategoryTreeItem } from '~/client/generated/graphql';
import { getCategoryTree } from '~/client/queries/getCategoryTree';

const getEntityIdsOfChildren = (categories: CategoryTreeItem[] | undefined) => {
  let entityIds: number[] = [];

  if (!categories) {
    return entityIds;
  }

  categories.forEach((category) => {
    entityIds.push(category.entityId);
    entityIds = entityIds.concat(getEntityIdsOfChildren(category.children));
  });

  return entityIds;
};

export async function generateStaticParams() {
  const categories = await getCategoryTree();

  const entityIds = getEntityIdsOfChildren(categories);

  return entityIds.map((entityId) => ({
    slug: entityId.toString(),
  }));
}

interface CategoryPageProps {
  params: { slug: string };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  return <CategoryPageContents params={params} />;
}

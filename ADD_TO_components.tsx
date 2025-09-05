"use client";

import { runtime } from "~/makeswift/runtime";
import { NumberInput } from "@makeswift/runtime/controls";
import DynamicProductGrid from "~/components/mx/DynamicProductGrid";

function DynamicGridWrapper({
  categoryId,
  limit,
  columns,
  gap,
  cardRadius,
}: {
  categoryId: number;
  limit?: number;
  columns?: number;
  gap?: number;
  cardRadius?: number;
}) {
  return (
    <DynamicProductGrid
      categoryId={categoryId}
      limit={limit}
      columns={columns}
      gap={gap}
      cardRadius={cardRadius}
    />
  );
}

runtime.registerComponent(DynamicGridWrapper, {
  type: "product-grid-dynamic-mx",
  label: "Grid de productos (Dinámico) — MX",
  props: {
    categoryId: NumberInput({ label: "Category ID (BigCommerce)", defaultValue: 0 }),
    limit: NumberInput({ label: "Límite", defaultValue: 12 }),
    columns: NumberInput({ label: "Columnas (1–4)", defaultValue: 3 }),
    gap: NumberInput({ label: "Separación (px)", defaultValue: 16 }),
    cardRadius: NumberInput({ label: "Radio tarjeta (px)", defaultValue: 12 }),
  },
});

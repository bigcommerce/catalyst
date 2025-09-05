# Dynamic Product Grid — MXPlantae

Añade:
- API: `core/app/api/mxplantae/products/route.ts`
- Componente de app: `core/components/mx/DynamicProductGrid.tsx`
- Registro para MakeSwift: añade el bloque de abajo a `core/makeswift/components.tsx`

## Cómo usar
1) Copia estos archivos en tu repo.
2) Asegúrate de tener `@makeswift/runtime` instalado y la integración previa.
3) En MakeSwift, inserta **"Grid de productos (Dinámico) — MX"** y define el **Category ID** de BigCommerce.

## Nota
Usa SWR en el cliente y un endpoint del propio sitio para obtener los productos del servidor (seguro y cacheable).

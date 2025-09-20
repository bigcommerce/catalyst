# MakeSwift Add-on para MXPlantae (Catalyst/Next.js)

Este paquete contiene los archivos mínimos para integrar **MakeSwift** dentro de tu app `core` bajo la ruta **/cms/**.

## Archivos incluidos
- `core/makeswift/runtime.ts` → instancia del runtime
- `core/makeswift/client.ts` → cliente con tu API key
- `core/makeswift/components.tsx` → registro de un componente ejemplo
- `core/makeswift/provider.tsx` → provider para estilos/preview
- `core/app/cms/[[...path]]/page.tsx` → ruta para páginas MakeSwift bajo /cms/*
- `core/app/api/makeswift/[...makeswift]/route.ts` → handler para preview/revalidate

## Cambios que debes hacer tú
1) **Instalar dependencia** en el paquete `core`:
   ```bash
   pnpm -F ./core add @makeswift/runtime
   ```
2) **Agregar el Provider al layout** `core/app/[locale]/layout.tsx`:
   - Imports arriba del archivo:
     ```ts
     import { getSiteVersion } from "@makeswift/runtime/next/server";
     import { MakeswiftProvider } from "~/makeswift/provider";
     import "~/makeswift/components";
     ```
   - En el JSX, ENVUELVE el `<body>` con:
     ```tsx
     <MakeswiftProvider siteVersion={await getSiteVersion()}>
       {children}
     </MakeswiftProvider>
     ```
3) **Editar `core/next.config.ts`** para aplicar el plugin:
   - Agrega:
     ```ts
     import createWithMakeswift from "@makeswift/runtime/next/plugin";
     const withMakeswift = createWithMakeswift();
     ```
   - Aplica el plugin junto al de next-intl:
     ```ts
     nextConfig = withNextIntl(nextConfig);
     nextConfig = withMakeswift(nextConfig);
     ```
4) **Variables de entorno**: en `.env.local` y en Vercel agrega:
   ```
   MAKESWIFT_SITE_API_KEY=msk_live_xxxxxxxxxxxxxxxxx
   ```
5) **CSP (si la usas)**: añade dominios de MakeSwift a `connect-src`, `img-src`, etc.
6) **Crea tu página en MakeSwift** con URL que **empiece con `/cms/`** (ej. `/cms/landing-suscripciones`).

## Probar
```bash
pnpm dev
# luego visita http://localhost:3000/cms/landing-suscripciones
```


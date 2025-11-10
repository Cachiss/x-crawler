# Ejemplos de Uso

Este directorio contiene ejemplos de cómo usar la librería Twitter Crawler.

## Archivos

- `ejemplo-simple.ts` - Ejemplo básico y rápido para empezar
- `ejemplo-uso.ts` - Ejemplos completos de todas las funcionalidades

## Cómo ejecutar

1. Asegúrate de tener instaladas las dependencias:
```bash
cd lib/twitter-crawler
npm install
```

2. Compila TypeScript (si es necesario):
```bash
npx tsc
```

3. Ejecuta el ejemplo simple:
```bash
npx ts-node examples/ejemplo-simple.ts
```

O ejecuta los ejemplos completos:
```bash
npx ts-node examples/ejemplo-uso.ts
```

## Nota importante

⚠️ **Recuerda reemplazar `'TU_TOKEN_AQUI'` con tu token de autenticación real de Twitter/X**

Para obtener tu token:
1. Inicia sesión en Twitter/X en tu navegador
2. Abre las herramientas de desarrollador (F12)
3. Ve a la pestaña Application/Storage > Cookies
4. Busca la cookie `auth_token` en el dominio `.x.com` o `.twitter.com`
5. Copia el valor de la cookie


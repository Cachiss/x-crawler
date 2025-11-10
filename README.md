# Twitter Crawler Library

Librería para crawlear tweets y respuestas de Twitter/X con autenticación.

## Instalación

```bash
npm install @cachis/x-crawler
```

O con yarn:

```bash
yarn add @cachis/x-crawler
```

**Nota:** Esta librería requiere Playwright como dependencia peer. Asegúrate de instalarlo:

```bash
npm install playwright
```

## Uso

### Inicialización

```typescript
import { TwitterCrawler } from '@cachis/x-crawler';

// Inicializar con token de autenticación (requerido)
const crawler = TwitterCrawler.init({
  authToken: 'tu_token_aqui',
  configType: 'default' // opcional: 'default' | 'aggressive' | 'conservative'
});
```

### Crawlear Tweets

```typescript
// Búsqueda por palabras clave
const tweets = await crawler.crawlTweets({
  searchKeywords: 'palabra clave',
  targetCount: 100,
  searchTab: 'LATEST', // 'LATEST' | 'TOP'
  searchFromDate: '2024-01-01',
  searchToDate: '2024-12-31',
  onLog: (message) => console.log(message),
  onProgress: (progress) => console.log(`Tweets recolectados: ${progress.collectedTweets}`)
});

// Búsqueda por usuarios
const userTweets = await crawler.crawlTweets({
  searchUsernames: ['usuario1', 'usuario2'],
  targetCount: 50
});

// Crawlear hilo de tweet
const threadTweets = await crawler.crawlTweets({
  tweetThreadUrl: 'https://x.com/usuario/status/1234567890',
  targetCount: -1 // -1 para sin límite
});
```

### Crawlear Respuestas

```typescript
// Respuestas de un tweet
const replies = await crawler.crawlReplies({
  tweetUrl: 'https://x.com/usuario/status/1234567890',
  idTweet: 1, // opcional
  maxReplies: 50, // -1 para sin límite
  onLog: (message) => console.log(message)
});

// Respuestas de múltiples tweets
const results = await crawler.crawlMultipleReplies({
  tweets: [
    { id: 1, tweet_url: 'https://x.com/usuario/status/1234567890', usuario_twitter: 'usuario' },
    { id: 2, tweet_url: 'https://x.com/usuario/status/0987654321', usuario_twitter: 'usuario' }
  ],
  maxReplies: 50,
  onLog: (message) => console.log(message)
});
```

## Configuración

La librería soporta tres tipos de configuración:

- **default**: Equilibrio entre velocidad y estabilidad
- **aggressive**: Más rápido, ideal para cuentas con buenos límites
- **conservative**: Más lento pero muy estable, ideal para cuentas con límites bajos

```typescript
const crawler = TwitterCrawler.init({
  authToken: 'tu_token',
  configType: 'aggressive'
});

// O cambiar la configuración después
crawler.setConfigType('conservative');
```

## Tipos

```typescript
import { TweetHash, TweetAnswer, CrawlRepliesResult } from '@cachis/x-crawler';
```

## Notas

- La librería requiere un token de autenticación válido de Twitter/X
- El token debe ser inyectado como cookie `auth_token`
- La librería usa Playwright para automatizar el navegador
- Se recomienda usar rotación de tokens para evitar rate limits


/**
 * Utilities for token and rate limit error detection
 */

// Constants for token and rate limit error detection
export const TOKEN_ERROR_PATTERNS = {
  RATE_LIMIT: {
    en: ['rate limit'],
    es: ['límite de tasa', 'limite de tasa']
  },
  TOKEN_BLOCKED: {
    en: ['something went wrong'],
    es: ['algo salió mal', 'algo salio mal']
  }
} as const;

// Constants for end of content detection
export const END_OF_CONTENT_PATTERNS = {
  en: [
    "No results for",
    "End of timeline",
    "No more tweets",
    "Hmm...this page doesn't exist",
    "No more Tweets available",
    "You're up to date",
    "That's all for now"
  ],
  es: [
    "No se encontraron",
    "Fin de la cronología",
    "No hay más tweets",
    "Parece que esta página no existe",
    "No hay más Tweets disponibles",
    "Estás al día",
    "Eso es todo por ahora"
  ]
} as const;

/**
 * Checks if a text contains token errors
 */
export function detectTokenError(responseText: string): { 
  hasError: boolean; 
  errorType: 'RATE_LIMIT' | 'TOKEN_BLOCKED' | null;
  reason: string;
} {
  const lowerText = responseText.toLowerCase();
  
  // Check rate limit
  const rateLimitPatterns = [...TOKEN_ERROR_PATTERNS.RATE_LIMIT.en, ...TOKEN_ERROR_PATTERNS.RATE_LIMIT.es];
  if (rateLimitPatterns.some(pattern => lowerText.includes(pattern))) {
    return {
      hasError: true,
      errorType: 'RATE_LIMIT',
      reason: 'Rate limit detected'
    };
  }
  
  // Check blocked token
  const tokenBlockedPatterns = [...TOKEN_ERROR_PATTERNS.TOKEN_BLOCKED.en, ...TOKEN_ERROR_PATTERNS.TOKEN_BLOCKED.es];
  if (tokenBlockedPatterns.some(pattern => lowerText.includes(pattern))) {
    return {
      hasError: true,
      errorType: 'TOKEN_BLOCKED',
      reason: 'Token bloqueado - Something went wrong'
    };
  }
  
  return {
    hasError: false,
    errorType: null,
    reason: ''
  };
}

/**
 * Checks for errors in error messages
 */
export function detectTokenErrorInMessage(errorMessage: string): boolean {
  const lowerMessage = errorMessage.toLowerCase();
  const allPatterns = [
    ...TOKEN_ERROR_PATTERNS.RATE_LIMIT.en,
    ...TOKEN_ERROR_PATTERNS.RATE_LIMIT.es,
    ...TOKEN_ERROR_PATTERNS.TOKEN_BLOCKED.en,
    ...TOKEN_ERROR_PATTERNS.TOKEN_BLOCKED.es
  ];
  
  return allPatterns.some(pattern => lowerMessage.includes(pattern));
}

/**
 * Gets all end of content patterns
 */
export function getAllEndOfContentPatterns(): string[] {
  return [...END_OF_CONTENT_PATTERNS.en, ...END_OF_CONTENT_PATTERNS.es];
}


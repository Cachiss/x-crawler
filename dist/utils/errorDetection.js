"use strict";
/**
 * Utilities for token and rate limit error detection
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.END_OF_CONTENT_PATTERNS = exports.TOKEN_ERROR_PATTERNS = void 0;
exports.detectTokenError = detectTokenError;
exports.detectTokenErrorInMessage = detectTokenErrorInMessage;
exports.getAllEndOfContentPatterns = getAllEndOfContentPatterns;
// Constants for token and rate limit error detection
exports.TOKEN_ERROR_PATTERNS = {
    RATE_LIMIT: {
        en: ['rate limit'],
        es: ['límite de tasa', 'limite de tasa']
    },
    TOKEN_BLOCKED: {
        en: ['something went wrong'],
        es: ['algo salió mal', 'algo salio mal']
    }
};
// Constants for end of content detection
exports.END_OF_CONTENT_PATTERNS = {
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
};
/**
 * Checks if a text contains token errors
 */
function detectTokenError(responseText) {
    const lowerText = responseText.toLowerCase();
    // Check rate limit
    const rateLimitPatterns = [...exports.TOKEN_ERROR_PATTERNS.RATE_LIMIT.en, ...exports.TOKEN_ERROR_PATTERNS.RATE_LIMIT.es];
    if (rateLimitPatterns.some(pattern => lowerText.includes(pattern))) {
        return {
            hasError: true,
            errorType: 'RATE_LIMIT',
            reason: 'Rate limit detected'
        };
    }
    // Check blocked token
    const tokenBlockedPatterns = [...exports.TOKEN_ERROR_PATTERNS.TOKEN_BLOCKED.en, ...exports.TOKEN_ERROR_PATTERNS.TOKEN_BLOCKED.es];
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
function detectTokenErrorInMessage(errorMessage) {
    const lowerMessage = errorMessage.toLowerCase();
    const allPatterns = [
        ...exports.TOKEN_ERROR_PATTERNS.RATE_LIMIT.en,
        ...exports.TOKEN_ERROR_PATTERNS.RATE_LIMIT.es,
        ...exports.TOKEN_ERROR_PATTERNS.TOKEN_BLOCKED.en,
        ...exports.TOKEN_ERROR_PATTERNS.TOKEN_BLOCKED.es
    ];
    return allPatterns.some(pattern => lowerMessage.includes(pattern));
}
/**
 * Gets all end of content patterns
 */
function getAllEndOfContentPatterns() {
    return [...exports.END_OF_CONTENT_PATTERNS.en, ...exports.END_OF_CONTENT_PATTERNS.es];
}
//# sourceMappingURL=errorDetection.js.map
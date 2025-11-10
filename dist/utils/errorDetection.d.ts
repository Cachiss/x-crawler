/**
 * Utilities for token and rate limit error detection
 */
export declare const TOKEN_ERROR_PATTERNS: {
    readonly RATE_LIMIT: {
        readonly en: readonly ["rate limit"];
        readonly es: readonly ["límite de tasa", "limite de tasa"];
    };
    readonly TOKEN_BLOCKED: {
        readonly en: readonly ["something went wrong"];
        readonly es: readonly ["algo salió mal", "algo salio mal"];
    };
};
export declare const END_OF_CONTENT_PATTERNS: {
    readonly en: readonly ["No results for", "End of timeline", "No more tweets", "Hmm...this page doesn't exist", "No more Tweets available", "You're up to date", "That's all for now"];
    readonly es: readonly ["No se encontraron", "Fin de la cronología", "No hay más tweets", "Parece que esta página no existe", "No hay más Tweets disponibles", "Estás al día", "Eso es todo por ahora"];
};
/**
 * Checks if a text contains token errors
 */
export declare function detectTokenError(responseText: string): {
    hasError: boolean;
    errorType: 'RATE_LIMIT' | 'TOKEN_BLOCKED' | null;
    reason: string;
};
/**
 * Checks for errors in error messages
 */
export declare function detectTokenErrorInMessage(errorMessage: string): boolean;
/**
 * Gets all end of content patterns
 */
export declare function getAllEndOfContentPatterns(): string[];
//# sourceMappingURL=errorDetection.d.ts.map
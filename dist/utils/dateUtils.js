"use strict";
/**
 * Utilidades para manejo de fechas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertTweetDateToMexicanTime = convertTweetDateToMexicanTime;
/**
 * Convierte una fecha de tweet (de Twitter) a hora mexicana
 * @param tweetDateString Fecha del tweet en formato string (ej: "Wed Oct 05 20:02:20 +0000 2022")
 * @returns Date ajustada a hora mexicana (UTC-6)
 */
function convertTweetDateToMexicanTime(tweetDateString) {
    // Parsear la fecha del tweet
    const tweetDate = new Date(tweetDateString);
    // Si la fecha viene 6 horas adelantada, restamos 6 horas para corregirla
    const correctedTime = new Date(tweetDate.getTime() - (6 * 60 * 60 * 1000));
    return correctedTime;
}
//# sourceMappingURL=dateUtils.js.map
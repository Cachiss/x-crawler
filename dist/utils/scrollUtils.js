"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrollUp = scrollUp;
exports.scrollDown = scrollDown;
exports.humanScrollDown = humanScrollDown;
/**
 * Scroll up the page
 */
async function scrollUp(page) {
    await page.evaluate(() => {
        window.scrollTo(0, 0);
    });
}
/**
 * Scroll down the page
 */
async function scrollDown(page) {
    await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
    });
}
/**
 * Human-like scroll down (optimized)
 */
async function humanScrollDown(page) {
    const scrollDistance = Math.floor(Math.random() * 400) + 600; // Entre 600 y 1000 px
    const scrollSteps = Math.floor(Math.random() * 3) + 4; // Entre 4 y 6 pasos
    const stepSize = scrollDistance / scrollSteps;
    for (let i = 0; i < scrollSteps; i++) {
        await page.evaluate((step) => {
            window.scrollBy({
                top: step,
                behavior: 'smooth'
            });
        }, stepSize);
        await page.waitForTimeout(Math.floor(Math.random() * 15) + 10); // 10-25ms
    }
}
//# sourceMappingURL=scrollUtils.js.map
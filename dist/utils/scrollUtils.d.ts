/**
 * Utilities for scrolling web pages
 */
import type { Page } from "@playwright/test";
/**
 * Scroll up the page
 */
export declare function scrollUp(page: Page): Promise<void>;
/**
 * Scroll down the page
 */
export declare function scrollDown(page: Page): Promise<void>;
/**
 * Human-like scroll down (optimized)
 */
export declare function humanScrollDown(page: Page): Promise<void>;
//# sourceMappingURL=scrollUtils.d.ts.map
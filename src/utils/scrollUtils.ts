/**
 * Utilities for scrolling web pages
 */
import type { Page } from "@playwright/test";

/**
 * Scroll up the page
 */
export async function scrollUp(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
}

/**
 * Scroll down the page
 */
export async function scrollDown(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
}

/**
 * Human-like scroll down (optimized)
 */
export async function humanScrollDown(page: Page): Promise<void> {
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


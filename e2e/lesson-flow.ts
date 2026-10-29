import { expect, type Page } from '@playwright/test';

/** Read the actual mini-lesson before its first dialogue, without a test bypass. */
export async function readMiniLesson(page: Page): Promise<void> {
  for (let card = 0; card < 12; card++) {
    const next = page.locator('[data-action="advance-notion"]');
    if (!await next.count()) return;
    await expect(page.locator('.ma-notion-intro h1')).toBeVisible();
    await expect(page.locator('.ma-dialogue-discovery, #ma-exercise-form')).toHaveCount(0);
    await next.click();
  }
  throw new Error('A mini-lesson must stay short.');
}

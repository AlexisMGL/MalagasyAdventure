import { expect, type Page } from '@playwright/test';

/** Open the dialogue from its real, freely browsable mini-lesson. */
export async function readMiniLesson(page: Page): Promise<void> {
  const begin = page.locator('[data-action="begin-dialogue"]');
  if (await begin.count()) {
    await expect(page.locator('.ma-notion-intro h1')).toBeVisible();
    await expect(page.locator('.ma-dialogue-discovery, #ma-exercise-form')).toHaveCount(0);
    await begin.click();
  }
}

import { test, expect } from '@playwright/test';

test.describe('Game Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('games-grid')).toBeVisible();
  });

  test('should display category and publisher filter controls', async ({ page }) => {
    await test.step('Verify filter panel is visible with both filter groups', async () => {
      await expect(page.getByTestId('game-filters')).toBeVisible();
      await expect(page.getByRole('group', { name: 'Category' })).toBeVisible();
      await expect(page.getByRole('group', { name: 'Publisher' })).toBeVisible();
    });

    await test.step('Verify the clear filters control is visible', async () => {
      await expect(page.getByTestId('clear-filters-button')).toBeVisible();
    });

    await test.step('Verify the status region announces the full game count', async () => {
      const totalCount = await page.getByTestId('game-card').count();
      await expect(page.getByTestId('filter-status')).toHaveText(`Showing all ${totalCount} games.`);
    });
  });

  test('should narrow the game list when a single category filter is selected', async ({ page }) => {
    const totalCount = await page.getByTestId('game-card').count();

    await test.step('Select the Puzzle category filter', async () => {
      await page.getByLabel('Puzzle', { exact: true }).check();
    });

    await test.step('Verify only Puzzle games remain visible', async () => {
      const visibleCards = page.locator('[data-testid="game-card"]:visible');
      const visibleCount = await visibleCards.count();
      expect(visibleCount).toBeGreaterThan(0);
      expect(visibleCount).toBeLessThan(totalCount);

      const categoryTags = await visibleCards.getByTestId('game-category').allTextContents();
      expect(categoryTags.every((text) => text === 'Puzzle')).toBe(true);
    });

    await test.step('Verify the status region reflects the narrowed count', async () => {
      const visibleCount = await page.locator('[data-testid="game-card"]:visible').count();
      await expect(page.getByTestId('filter-status')).toHaveText(`Showing ${visibleCount} of ${totalCount} games.`);
    });
  });

  test('should OR multiple selected categories together', async ({ page }) => {
    await test.step('Select both the Puzzle and Strategy category filters', async () => {
      await page.getByLabel('Puzzle', { exact: true }).check();
      await page.getByLabel('Strategy', { exact: true }).check();
    });

    await test.step('Verify visible games belong to either selected category', async () => {
      const visibleCards = page.locator('[data-testid="game-card"]:visible');
      const categoryTags = await visibleCards.getByTestId('game-category').allTextContents();
      expect(categoryTags.length).toBeGreaterThan(0);
      expect(categoryTags.every((text) => text === 'Puzzle' || text === 'Strategy')).toBe(true);
    });
  });

  test('should narrow the game list when a publisher filter is selected', async ({ page }) => {
    const totalCount = await page.getByTestId('game-card').count();

    await test.step('Select the GitHub Games publisher filter', async () => {
      await page.getByLabel('GitHub Games', { exact: true }).check();
    });

    await test.step('Verify only GitHub Games titles remain visible', async () => {
      const visibleCards = page.locator('[data-testid="game-card"]:visible');
      const visibleCount = await visibleCards.count();
      expect(visibleCount).toBeGreaterThan(0);
      expect(visibleCount).toBeLessThan(totalCount);

      const publisherTags = await visibleCards.getByTestId('game-publisher').allTextContents();
      expect(publisherTags.every((text) => text === 'GitHub Games')).toBe(true);
    });
  });

  test('should combine category and publisher filters with AND logic', async ({ page }) => {
    await test.step('Select both a category and a publisher filter', async () => {
      await page.getByLabel('Puzzle', { exact: true }).check();
      await page.getByLabel('GitHub Games', { exact: true }).check();
    });

    await test.step('Verify visible cards match both the category and the publisher', async () => {
      const visibleCards = page.locator('[data-testid="game-card"]:visible');
      await expect(visibleCards).toHaveCount(1);
      await expect(visibleCards.getByTestId('game-category')).toHaveText('Puzzle');
      await expect(visibleCards.getByTestId('game-publisher')).toHaveText('GitHub Games');
    });
  });

  test('should restore the full game list when filters are cleared', async ({ page }) => {
    const totalCount = await page.getByTestId('game-card').count();

    await test.step('Apply a category filter', async () => {
      await page.getByLabel('Puzzle', { exact: true }).check();
      await expect(page.locator('[data-testid="game-card"]:visible')).not.toHaveCount(totalCount);
    });

    await test.step('Click clear filters', async () => {
      await page.getByTestId('clear-filters-button').click();
    });

    await test.step('Verify all games are visible again', async () => {
      await expect(page.locator('[data-testid="game-card"]:visible')).toHaveCount(totalCount);
      await expect(page.getByTestId('filter-status')).toHaveText(`Showing all ${totalCount} games.`);
    });
  });
});

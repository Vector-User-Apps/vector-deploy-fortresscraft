import { test, expect } from '@playwright/test'

test.describe('Leaderboard Page', () => {
  test('loads leaderboard page', async ({ page }) => {
    await page.goto('/leaderboard')
    await page.waitForLoadState('networkidle')

    await expect(page.getByTestId('leaderboard-page')).toBeVisible()
  })
})

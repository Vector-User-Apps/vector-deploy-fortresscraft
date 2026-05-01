import { test, expect } from '@playwright/test'

test.describe('Main Menu', () => {
  test('renders menu with Play, Leaderboard, and How to Play buttons', async ({ page }) => {
    await page.goto('/play')
    await page.waitForLoadState('networkidle')

    await expect(page.getByTestId('main-menu')).toBeVisible()
    await expect(page.getByTestId('menu.play-button')).toBeVisible()
    await expect(page.getByTestId('menu.leaderboard-button')).toBeVisible()
    await expect(page.getByTestId('menu.howtoplay-button')).toBeVisible()
  })

  test('navigates to How to Play page', async ({ page }) => {
    await page.goto('/play')
    await page.waitForLoadState('networkidle')

    await page.getByTestId('menu.howtoplay-button').click()
    await page.waitForLoadState('networkidle')

    await expect(page.getByTestId('how-to-play')).toBeVisible()
  })

  test('navigates to Leaderboard page', async ({ page }) => {
    await page.goto('/play')
    await page.waitForLoadState('networkidle')

    await page.getByTestId('menu.leaderboard-button').click()
    await page.waitForLoadState('networkidle')

    await expect(page.getByTestId('leaderboard-page')).toBeVisible()
  })
})

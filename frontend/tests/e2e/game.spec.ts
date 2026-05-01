import { test, expect } from '@playwright/test'

test.describe('Game Page', () => {
  test('loads game page with canvas and HUD elements', async ({ page }) => {
    await page.goto('/play/game')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await expect(page.getByTestId('game-page')).toBeVisible()
    await expect(page.locator('canvas')).toBeVisible()
    await expect(page.getByTestId('hud')).toBeVisible()
    await expect(page.getByTestId('hud.gold')).toBeVisible()
    await expect(page.getByTestId('hud.lives')).toBeVisible()
    await expect(page.getByTestId('hud.wave')).toBeVisible()
    await expect(page.getByTestId('hud.score')).toBeVisible()
  })

  test('shows tower panel with 5 towers', async ({ page }) => {
    await page.goto('/play/game')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await expect(page.getByTestId('tower-panel')).toBeVisible()
    await expect(page.getByTestId('tower-panel.tower.arrow')).toBeVisible()
    await expect(page.getByTestId('tower-panel.tower.cannon')).toBeVisible()
    await expect(page.getByTestId('tower-panel.tower.frost')).toBeVisible()
    await expect(page.getByTestId('tower-panel.tower.sniper')).toBeVisible()
    await expect(page.getByTestId('tower-panel.tower.tesla')).toBeVisible()
  })

  test('shows start wave button', async ({ page }) => {
    await page.goto('/play/game')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await expect(page.getByTestId('wave-controls')).toBeVisible()
    await expect(page.getByTestId('wave-controls.start')).toBeVisible()
  })
})

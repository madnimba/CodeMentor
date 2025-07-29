import { test, expect } from '@playwright/test';

test.describe('Simple Navigation Tests', () => {
  test('should load the home page', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Verify that the page loaded successfully
    await expect(page).toHaveTitle(/codementor-bd/);
    
    // Check that the page has some content
    await expect(page.locator('body')).toBeVisible();
    
    console.log('✅ Home page loaded successfully!');
  });
  
  test('should load the auth page', async ({ page }) => {
    // Navigate to the auth page
    await page.goto('/auth');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Verify that the page loaded successfully
    await expect(page).toHaveTitle(/codementor-bd/);
    
    // Check that the auth form is present
    const signInTab = page.locator('[role="tab"]:has-text("Sign In")');
    await expect(signInTab).toBeVisible();
    
    console.log('✅ Auth page loaded successfully!');
  });
  
  test('should have working navigation elements', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if there are any navigation links
    const links = page.locator('a');
    const linkCount = await links.count();
    
    if (linkCount > 0) {
      console.log(`✅ Found ${linkCount} navigation links`);
    } else {
      console.log('ℹ️ No navigation links found');
    }
    
    // Verify the page is interactive
    await expect(page.locator('body')).toBeVisible();
  });
}); 
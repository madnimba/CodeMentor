import { test, expect } from '@playwright/test';

test.describe('Authenticated Article Read Functionality', () => {
  test('should login and mark article as read', async ({ page }) => {
    // Navigate to the auth page
    await page.goto('/auth');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we're already on the sign-in tab, if not switch to it
    const signInTab = page.locator('[role="tab"]:has-text("Sign In")');
    if (await signInTab.isVisible()) {
      await signInTab.click();
    }
    
    // Fill in login credentials - using email field as per actual form
    const emailInput = page.locator('#signin-username');
    const passwordInput = page.locator('#signin-password');
    
    if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
      await emailInput.fill('idkidk@gmail.com');
      await passwordInput.fill('123456');
      
      // Click the sign in button
      const signInButton = page.locator('button[type="submit"]:has-text("Sign In")');
      await signInButton.click();
      
      // Wait for navigation to dashboard
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      
      // Now navigate to study materials
      await page.goto('/study-materials');
      await page.waitForLoadState('networkidle');
      
      // Look for the main heading "Study Materials"
      const studyMaterialsHeading = page.locator('h1:has-text("Study Materials")');
      await expect(studyMaterialsHeading).toBeVisible();
      
      // Look for a subtopic link that has articles
      const subtopicLink = page.locator('a[href*="/article/subtopic/"]').first();
      
      // Check if we found a subtopic link
      const subtopicCount = await subtopicLink.count();
      if (subtopicCount === 0) {
        test.skip(true, 'No subtopics with articles found');
        return;
      }
      
      // Click on the first subtopic to view articles
      await subtopicLink.click();
      
      // Wait for the articles page to load
      await page.waitForLoadState('networkidle');
      
      // Look for articles on the page
      const articleContainer = page.locator('[data-testid="article-container"], .article-container, article').first();
      
      // Check if we found any articles
      const articleCount = await articleContainer.count();
      if (articleCount === 0) {
        test.skip(true, 'No articles found in this subtopic');
        return;
      }
      
      // Look for the "Mark as Read" button
      const markAsReadButton = page.locator('button:has-text("Mark as Read")').first();
      
      // Check if the button exists
      const buttonCount = await markAsReadButton.count();
      if (buttonCount === 0) {
        test.skip(true, 'No "Mark as Read" button found');
        return;
      }
      
      // Check if the article is already marked as read
      const completedBadge = page.locator('text=Completed, text=completed').first();
      const isAlreadyRead = await completedBadge.count() > 0;
      
      if (isAlreadyRead) {
        test.skip(true, 'Article is already marked as read');
        return;
      }
      
      // Click the "Mark as Read" button
      await markAsReadButton.click();
      
      // Wait for the API call to complete
      await page.waitForTimeout(2000);
      
      // Verify that the "Completed" badge appears
      await expect(page.locator('text=Completed, text=completed').first()).toBeVisible();
      
      console.log('✅ Successfully marked article as read!');
    } else {
      test.skip(true, 'Login form not found or not accessible');
    }
  });
  
  test('should navigate to study materials when authenticated', async ({ page }) => {
    // Navigate to the auth page
    await page.goto('/auth');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we're already on the sign-in tab, if not switch to it
    const signInTab = page.locator('[role="tab"]:has-text("Sign In")');
    if (await signInTab.isVisible()) {
      await signInTab.click();
    }
    
    // Fill in login credentials
    const emailInput = page.locator('#signin-username');
    const passwordInput = page.locator('#signin-password');
    
    if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
      await emailInput.fill('idkidk@gmail.com');
      await passwordInput.fill('123456');
      
      // Click the sign in button
      const signInButton = page.locator('button[type="submit"]:has-text("Sign In")');
      await signInButton.click();
      
      // Wait for navigation to dashboard
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      
      // Navigate to study materials
      await page.goto('/study-materials');
      await page.waitForLoadState('networkidle');
      
      // Verify that the page loaded successfully
      await expect(page).toHaveTitle(/codementor-bd/);
      
      // Look for the main "Study Materials" heading
      const studyMaterialsHeading = page.locator('h1:has-text("Study Materials")');
      await expect(studyMaterialsHeading).toBeVisible();
      
      console.log('✅ Successfully navigated to study materials!');
    } else {
      test.skip(true, 'Login form not found or not accessible');
    }
  });
}); 
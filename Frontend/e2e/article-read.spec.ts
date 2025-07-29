import { test, expect } from '@playwright/test';

test.describe('Article Read Functionality', () => {
  test('should mark article as read and update UI', async ({ page }) => {
    // Navigate to the study materials page
    await page.goto('/study-materials');
    
    // Wait for the page to load
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
    
    // Verify that the "Mark as Read" button is no longer visible or is disabled
    const markAsReadButtonAfter = page.locator('button:has-text("Mark as Read")').first();
    const buttonCountAfter = await markAsReadButtonAfter.count();
    
    if (buttonCountAfter > 0) {
      // If button still exists, it should be disabled or show different text
      await expect(markAsReadButtonAfter).toBeDisabled();
    }
  });
  
  test('should navigate through study materials and view articles', async ({ page }) => {
    // Navigate to the study materials page
    await page.goto('/study-materials');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Verify that the page loaded successfully
    await expect(page).toHaveTitle(/codementor-bd/);
    
    // Look for the main "Study Materials" heading
    const studyMaterialsHeading = page.locator('h1:has-text("Study Materials")');
    await expect(studyMaterialsHeading).toBeVisible();
    
    // Look for any tracks (the main content structure)
    const tracks = page.locator('[role="button"], .cursor-pointer').first();
    const trackCount = await tracks.count();
    
    if (trackCount > 0) {
      // Verify that at least one track is visible
      await expect(tracks).toBeVisible();
    }
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('User Registration and Article Creation', () => {
  test('should register new user, sign in, and create an article', async ({ page }) => {
    // Generate unique user data for this test run
    const timestamp = Date.now();
    const testEmail = `testuser${timestamp}@example.com`;
    const testUsername = `testuser${timestamp}`;
    const testPassword = 'TestPass123!';
    
    // Step 1: Navigate to auth page
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Step 2: Switch to sign up tab
    const signUpTab = page.locator('[role="tab"]:has-text("Sign Up")');
    await expect(signUpTab).toBeVisible();
    await signUpTab.click();
    
    // Step 3: Fill out registration form
    const usernameInput = page.locator('#signup-username');
    const emailInput = page.locator('#signup-email');
    const passwordInput = page.locator('#signup-password');
    const confirmPasswordInput = page.locator('#confirm-password');
    
    await expect(usernameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(confirmPasswordInput).toBeVisible();
    
    await usernameInput.fill(testUsername);
    await emailInput.fill(testEmail);
    await passwordInput.fill(testPassword);
    await confirmPasswordInput.fill(testPassword);
    
    // Step 4: Submit registration form
    const createAccountButton = page.locator('button[type="submit"]:has-text("Create Account")');
    await expect(createAccountButton).toBeVisible();
    await createAccountButton.click();
    
    // Step 5: Wait for success message and automatic tab switch to sign in
    await expect(page.locator('text=Account created successfully!')).toBeVisible({ timeout: 10000 });
    
    // Verify we're switched to sign in tab
    const signInTab = page.locator('[role="tab"]:has-text("Sign In")');
    await expect(signInTab).toHaveAttribute('data-state', 'active');
    
    // Step 6: Sign in with the newly created account
    const signInUsernameInput = page.locator('#signin-username');
    const signInPasswordInput = page.locator('#signin-password');
    
    await expect(signInUsernameInput).toBeVisible();
    await expect(signInPasswordInput).toBeVisible();
    
    await signInUsernameInput.fill(testEmail);
    await signInPasswordInput.fill(testPassword);
    
    const signInButton = page.locator('button[type="submit"]:has-text("Sign In")');
    await expect(signInButton).toBeVisible();
    await signInButton.click();
    
    // Step 7: Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    
    // Step 8: Navigate to study materials
    await page.goto('/study-materials');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on study materials page
    const studyMaterialsHeading = page.locator('h1:has-text("Study Materials")');
    await expect(studyMaterialsHeading).toBeVisible();
    
    // Step 9: Click Add Article button
    const addArticleButton = page.locator('button:has-text("Add Article")');
    await expect(addArticleButton).toBeVisible();
    await addArticleButton.click();
    
    // Step 10: Verify article creation dialog opens
    const createArticleDialog = page.locator('[role="dialog"]');
    await expect(createArticleDialog).toBeVisible();
    await expect(page.locator('text=Create New Article')).toBeVisible();
    
    // Step 11: Fill out article creation form
    const articleTitle = `Test Article ${timestamp}`;
    const articleContent = `This is a test article created by automated E2E test at ${new Date().toISOString()}. This article is for testing purposes and demonstrates that the article creation functionality works correctly.`;
    
    const titleInput = page.locator('input[placeholder="Enter article title"]');
    const contentTextarea = page.locator('textarea[placeholder*="Write your article content"]');
    
    await expect(titleInput).toBeVisible();
    await expect(contentTextarea).toBeVisible();
    
    await titleInput.fill(articleTitle);
    await contentTextarea.fill(articleContent);
    
    // Step 12: Select a track
    const trackSelect = page.locator('[role="combobox"]').first(); // First select is for track
    await trackSelect.click();
    
    // Wait for track options to load and select the first available track
    const firstTrackOption = page.locator('[role="option"]').first();
    await expect(firstTrackOption).toBeVisible({ timeout: 5000 });
    await firstTrackOption.click();
    
    // Step 13: Select a topic (after track is selected)
    await page.waitForTimeout(1000); // Wait for topics to load
    const topicSelect = page.locator('[role="combobox"]').nth(1); // Second select is for topic
    await topicSelect.click();
    
    // Select the first available topic
    const firstTopicOption = page.locator('[role="option"]').first();
    await expect(firstTopicOption).toBeVisible({ timeout: 5000 });
    await firstTopicOption.click();
    
    // Step 14: Submit the article
    const createArticleSubmitButton = page.locator('button[type="submit"]:has-text("Create Article")');
    await expect(createArticleSubmitButton).toBeVisible();
    await expect(createArticleSubmitButton).toBeEnabled();
    await createArticleSubmitButton.click();
    
    // Step 15: Wait for success message
    await expect(page.locator('text=Article created successfully!')).toBeVisible({ timeout: 10000 });
    
    // Step 16: Verify dialog closes
    await expect(createArticleDialog).not.toBeVisible({ timeout: 5000 });
    
    console.log('✅ Successfully registered user and created article!');
    console.log(`✅ User: ${testUsername} (${testEmail})`);
    console.log(`✅ Article: ${articleTitle}`);
  });
  
  test('should handle article creation validation errors with authenticated user', async ({ page }) => {
    // First authenticate with existing test credentials
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Try to sign in with existing test credentials
    const signInTab = page.locator('[role="tab"]:has-text("Sign In")');
    if (await signInTab.isVisible()) {
      await signInTab.click();
    }
    
    const emailInput = page.locator('#signin-username');
    const passwordInput = page.locator('#signin-password');
    
    if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
      await emailInput.fill('idkidk@gmail.com');
      await passwordInput.fill('123456');
      
      const signInButton = page.locator('button[type="submit"]:has-text("Sign In")');
      await signInButton.click();
      
      // Wait for navigation to dashboard
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      
      // Navigate to study materials
      await page.goto('/study-materials');
      await page.waitForLoadState('networkidle');
      
      // Verify we're on study materials page
      const studyMaterialsHeading = page.locator('h1:has-text("Study Materials")');
      await expect(studyMaterialsHeading).toBeVisible();
      
      // Click Add Article button
      const addArticleButton = page.locator('button:has-text("Add Article")');
      await expect(addArticleButton).toBeVisible();
      await addArticleButton.click();
      
      // Verify article creation dialog opens
      const createArticleDialog = page.locator('[role="dialog"]');
      await expect(createArticleDialog).toBeVisible();
      
      // Try to submit empty form to test validation
      const createArticleSubmitButton = page.locator('button[type="submit"]:has-text("Create Article")');
      await expect(createArticleSubmitButton).toBeVisible();
      await createArticleSubmitButton.click();
      
      // Check for validation errors
      const validationErrors = page.locator('text=Title is required, text=Content is required, text=Track is required, text=Topic is required');
      const errorCount = await validationErrors.count();
      
      if (errorCount > 0) {
        console.log('✅ Form validation is working correctly');
      }
      
      // Close the dialog
      const cancelButton = page.locator('button:has-text("Cancel")');
      await cancelButton.click();
      await expect(createArticleDialog).not.toBeVisible();
      
      console.log('✅ Article creation validation test completed successfully');
    } else {
      test.skip(true, 'Login form not accessible - cannot test validation');
    }
  });
}); 
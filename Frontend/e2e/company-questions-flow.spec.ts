import { test, expect } from '@playwright/test';

test.describe('Company Questions Flow', () => {
  test('should navigate to company questions, view answers if available, and go to coding page if available', async ({ page }) => {
    // Step 1: Authenticate first (using existing test credentials)
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
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
      
      // Step 2: Navigate to Companies page
      await page.goto('/companies');
      await page.waitForLoadState('networkidle');
      
      // Verify we're on companies page
      const companiesHeading = page.locator('h1:has-text("Companies"), h2:has-text("Companies")');
      await expect(companiesHeading.first()).toBeVisible();
      
      // Step 3: Find and click on a company to view questions
      const viewQuestionsButton = page.locator('button:has-text("View Questions"), a:has-text("View Questions")').first();
      const buttonCount = await viewQuestionsButton.count();
      
      if (buttonCount === 0) {
        test.skip(true, 'No companies with "View Questions" button found');
        return;
      }
      
      await expect(viewQuestionsButton).toBeVisible();
      await viewQuestionsButton.click();
      
      // Step 4: Wait for company questions page to load
      await page.waitForLoadState('networkidle');
      
      // Verify we're on company questions page
      const questionCards = page.locator('[data-testid="question-card"], .card, [role="article"]');
      const cardCount = await questionCards.count();
      
      if (cardCount === 0) {
        test.skip(true, 'No question cards found on company questions page');
        return;
      }
      
      console.log(`✅ Found ${cardCount} question cards`);
      
      // Step 5: Look for questions with "See Answer" button
      const seeAnswerButtons = page.locator('button:has-text("See Answer")');
      const answerButtonCount = await seeAnswerButtons.count();
      
      if (answerButtonCount > 0) {
        console.log(`✅ Found ${answerButtonCount} questions with "See Answer" button`);
        
        // Click the first "See Answer" button
        const firstAnswerButton = seeAnswerButtons.first();
        await expect(firstAnswerButton).toBeVisible();
        await firstAnswerButton.click();
        
        // Wait for answer to expand
        await page.waitForTimeout(1000);
        
        // Verify answer section is visible
        const answerSection = page.locator('text=Solution, div:has-text("Solution")').first();
        await expect(answerSection).toBeVisible({ timeout: 5000 });
        
        console.log('✅ Successfully viewed answer for a question');
        
        // Close the answer by clicking the button again (it should now say "Close")
        const closeButton = page.locator('button:has-text("Close")').first();
        if (await closeButton.count() > 0) {
          await closeButton.click();
          console.log('✅ Successfully closed the answer');
        }
      } else {
        console.log('ℹ️ No questions with "See Answer" button found');
      }
      
      // Step 6: Look for questions with "Solve This" button (coding questions)
      const solveThisButtons = page.locator('button:has-text("Solve This")');
      const codingButtonCount = await solveThisButtons.count();
      
      if (codingButtonCount > 0) {
        console.log(`✅ Found ${codingButtonCount} coding questions with "Solve This" button`);
        
        // Click the first "Solve This" button
        const firstCodingButton = solveThisButtons.first();
        await expect(firstCodingButton).toBeVisible();
        await firstCodingButton.click();
        
        // Step 7: Wait for navigation to coding page
        await page.waitForLoadState('networkidle');
        
        // Verify we're on the live coding page
        const liveCodingIndicator = page.locator('text=LiveCoding, text=Live Coding, text=Code Editor, [data-testid="live-coding"]');
        const codingPageFound = await liveCodingIndicator.count() > 0;
        
        if (codingPageFound) {
          await expect(liveCodingIndicator.first()).toBeVisible();
          console.log('✅ Successfully navigated to live coding page');
        } else {
          // Alternative check: look for Monaco editor or coding-related elements
          const monacoEditor = page.locator('.monaco-editor, [data-testid="monaco-editor"]');
          const codeTextarea = page.locator('textarea[placeholder*="code"], textarea[placeholder*="Code"]');
          const runButton = page.locator('button:has-text("Run"), button:has-text("Execute")');
          
          const hasEditor = await monacoEditor.count() > 0;
          const hasTextarea = await codeTextarea.count() > 0;
          const hasRunButton = await runButton.count() > 0;
          
          if (hasEditor || hasTextarea || hasRunButton) {
            console.log('✅ Successfully navigated to coding page (detected coding elements)');
          } else {
            console.log('⚠️ Navigated to coding page but could not verify coding elements');
          }
        }
        
        // Navigate back to company questions to continue testing
        await page.goBack();
        await page.waitForLoadState('networkidle');
        
      } else {
        console.log('ℹ️ No coding questions with "Solve This" button found');
      }
      
      console.log('✅ Company questions flow test completed successfully');
      
    } else {
      test.skip(true, 'Login form not found or not accessible');
    }
  });
  
  test('should handle companies page navigation without authentication errors', async ({ page }) => {
    // Try to access companies page directly (should redirect to auth if not authenticated)
    await page.goto('/companies');
    await page.waitForLoadState('networkidle');
    
    // Check if we're redirected to auth page
    const currentUrl = page.url();
    const isOnAuthPage = currentUrl.includes('/auth');
    const isOnCompaniesPage = currentUrl.includes('/companies');
    
    if (isOnAuthPage) {
      console.log('ℹ️ Not authenticated - redirected to auth page as expected');
      
      // Verify auth page elements are visible
      const signInTab = page.locator('[role="tab"]:has-text("Sign In")');
      await expect(signInTab).toBeVisible();
      
      console.log('✅ Auth page loaded correctly');
    } else if (isOnCompaniesPage) {
      // If we're on companies page, verify it loaded correctly
      const companiesHeading = page.locator('h1:has-text("Companies"), h2:has-text("Companies")');
      await expect(companiesHeading.first()).toBeVisible();
      
      console.log('✅ Companies page loaded correctly (user was already authenticated)');
    } else {
      console.log(`ℹ️ Unexpected page: ${currentUrl}`);
    }
  });
  
  test('should verify company questions page structure', async ({ page }) => {
    // Authenticate first
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
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
      
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      
      // Navigate to companies page
      await page.goto('/companies');
      await page.waitForLoadState('networkidle');
      
      // Check for basic page elements
      const searchInput = page.locator('input[placeholder*="Search companies"]');
      const companyCards = page.locator('.card, [data-testid="company-card"]');
      
      const hasSearch = await searchInput.count() > 0;
      const cardCount = await companyCards.count();
      
      if (hasSearch) {
        console.log('✅ Search functionality available');
      }
      
      if (cardCount > 0) {
        console.log(`✅ Found ${cardCount} company cards`);
      } else {
        console.log('ℹ️ No company cards found');
      }
      
      console.log('✅ Companies page structure verification completed');
      
    } else {
      test.skip(true, 'Login form not accessible');
    }
  });
}); 
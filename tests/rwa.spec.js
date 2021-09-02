const { test, expect } = require("@playwright/test");
function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}
test("Wykonanie transakcji na nowym koncie użytkownika", async ({ page }) => {
  // Rejestracja nowego użytkownika
  await page.goto("http://localhost:3000/");
  await page.goto("http://localhost:3000/signup");
  const signupTitle = await page.textContent("h1");
  expect(signupTitle).toBe("Sign Up");
  await page.fill("#firstName", "Mateusz");
  await page.fill("#lastName", "Gut");
  await page.fill("#username", "GutMat");
  await page.fill("#password", "Test123$%");
  await page.fill("#confirmPassword", "Test123$%");
  await page.isEnabled("data-test=signup-submit");
  await page.click("data-test=signup-submit");
  const signinTitle = await page.textContent("h1");
  expect(signinTitle).toBe("Sign in");

  // Logowanie nowo założonego użytkownika do aplikacji
  await page.fill("#username", "GutMat");
  await page.fill("#password", "Test123$%");
  const signinButton = await page.$("data-test=signin-submit");
  await signinButton.isEnabled();
  await signinButton.click();

  // Wprowadzenie danych nowego użytkownika na ekranie startowym
  const onboardingDialog = page.locator("data-test=user-onboarding-dialog");
  await onboardingDialog.isVisible();
  const onboardingDialogTitle = await page.textContent(
    "data-test=user-onboarding-dialog-title"
  );
  expect(onboardingDialogTitle).toBe("Get Started with Real World App");
  await page.click("data-test=user-onboarding-next");
  const secondOnboardingTitle = page.locator(
    "data-test=user-onboarding-dialog-title"
  );
  await expect(secondOnboardingTitle).toHaveText("Create Bank Account");
  await page.fill("#bankaccount-bankName-input", "Narodowy Bank Polski");
  await page.fill("#bankaccount-routingNumber-input", "123456789");
  await page.fill("#bankaccount-accountNumber-input", "987654321");
  const saveButton = page.locator("data-test=bankaccount-submit");
  await expect(saveButton).toHaveText("Save");
  await page.click("data-test=bankaccount-submit");
  const finishOnboardingTitle = page.locator(
    "data-test=user-onboarding-dialog-title"
  );
  await expect(finishOnboardingTitle).toHaveText("Finished");
  const finishButton = page.locator("data-test=user-onboarding-next");
  await expect(finishButton).toHaveText("Done");
  await page.click("data-test=user-onboarding-next");
  const removedOnboardingDialog = await page.locator(
    "data-test=user-onboarding-dialog"
  );
  expect(removedOnboardingDialog.length).toBe(undefined);

  // Dodanie nowej transakcji
  const navUsername = page.locator("data-test=sidenav-username");
  await expect(navUsername).toContainText("GutMat");
  await page.click("data-test=nav-top-new-transaction");
  await expect(page).toHaveURL(/.*\/transaction\/new/);
  await page.click("li.MuiListItem-root");
  await page.fill("#amount", "100");
  await page.fill("#transaction-create-description-input", "Pożyczka");
  const requestButton = page.locator(
    "data-test=transaction-create-submit-request"
  );
  await requestButton.isEnabled();
  await page.click("data-test=transaction-create-submit-request");
  const successAlert = page.locator("data-test=alert-bar-success");
  await expect(successAlert).toBeVisible();
  await expect(successAlert).toContainText("Transaction Submitted!");
});

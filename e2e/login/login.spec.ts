import {expect, Page, test, TestInfo} from '@playwright/test';
import {defaultPassword, LoginPage} from '../../pages/login/LoginPage';
import {getMaxDiffPixels} from '../../helpers/common';

interface UsersCredential {
  username: string;
  password: string;
  positive?: boolean;
}

const testMethod = async (page: Page, testInfo: TestInfo, userCredential: UsersCredential) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.fillLoginForm(userCredential.username, userCredential.password);
  await expect(page).toHaveScreenshot(`${testInfo.title}-landing.png`, {maxDiffPixels: getMaxDiffPixels(1920, 1080)});
  await loginPage.clickOnLoginButton();
  if (userCredential.positive) {
    await loginPage.checkSuccessLogin();
  } else {
    await loginPage.takeScreenshotForErrorMessage(`${testInfo.title}-errorMessage.png`);
    await loginPage.checkNotSuccessLogin();
  }
};

test.describe('User should be able to login', async () => {
  test('login standard user', async ({page}, testInfo) => {
    const testUserCredential: UsersCredential = {
      username: 'standard_user',
      password: defaultPassword,
      positive: true,
    };
    await testMethod(page, testInfo, testUserCredential);
  });

  test('login performance_glitch_user', async ({page}, testInfo) => {
    const testUserCredential: UsersCredential = {
      username: 'performance_glitch_user',
      password: defaultPassword,
      positive: true,
    };
    await testMethod(page, testInfo, testUserCredential);
  });
  test('login problem user', async ({page}, testInfo) => {
    const testUserCredential: UsersCredential = {
      username: 'problem_user',
      password: defaultPassword,
      positive: true,
    };
    await testMethod(page, testInfo, testUserCredential);
  });
});

test.describe('User shouldn t be able to login', async () => {
  test('login locked_out_user', async ({page}, testInfo) => {
    const testUserCredential: UsersCredential = {username: 'locked_out_user', password: defaultPassword};
    await testMethod(page, testInfo, testUserCredential);
  });

  test('login invalid user with valid password', async ({page}, testInfo) => {
    const testUserCredential: UsersCredential = {username: 'invalid_user', password: defaultPassword};
    await testMethod(page, testInfo, testUserCredential);
  });

  test('login standard user with invalid password', async ({page}, testInfo) => {
    const testUserCredential: UsersCredential = {username: 'standard_user', password: '1123...'};
    await testMethod(page, testInfo, testUserCredential);
  });
  test('login with empty fields', async ({page}, testInfo) => {
    const testUserCredential: UsersCredential = {username: ' ', password: ' '};
    await testMethod(page, testInfo, testUserCredential);
  });
});

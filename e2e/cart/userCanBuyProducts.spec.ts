import {expect, test} from '@playwright/test';
import {loginTestHelper, productNames, productNamesAfterRemoveIndex1} from '../../helpers/common';
import {ProductsPage} from '../../pages/products/ProductsPage';
import {ProductPage} from '../../pages/products/ProductPage';
import {CartPage} from '../../pages/cart/CartPage';
import {PaymentDataPage} from '../../pages/cart/PaymentDataPage';
import {PaymentInformationPage} from '../../pages/cart/PaymentInformationPage';
import {CompletePage} from '../../pages/cart/CompletePage';
import {faker} from '@faker-js/faker';

test.describe('User can add items in cart, delete items and buy products', async () => {
  test('User can buy products', async ({page}) => {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const postCode = faker.address.zipCode();

    await loginTestHelper(page, 'standard_user');

    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    for (let productName of productNames) {
      await productsPage.addToProduct(productName);
    }
    await productsPage.goToCart();
    await cartPage.checkYourCartTextIsVisible();
    expect(await cartPage.getProductTitle(), 'Product title is not correct').toEqual(productNames);
    await cartPage.removeProduct('Sauce Labs Bike Light');
    expect(await cartPage.getProductTitle(), 'Product title is not correct').toEqual(productNamesAfterRemoveIndex1);

    await cartPage.clickCheckoutButton();
    const paymentDataPage = new PaymentDataPage(page);
    await paymentDataPage.checkoutInformationPageIsVisible();
    await paymentDataPage.fillInformationFields(firstName, lastName, postCode);
    await paymentDataPage.clickContinueButton();

    const paymentInformationPage = new PaymentInformationPage(page);
    await paymentInformationPage.checkCheckoutOverviewTextIsVisible();

    // TODO: сделать эти же проверки через переменные с эталонными данными

    // Эти проверки вытягивают данные со страницы (ожидаемый результат):
    expect(paymentInformationPage.getSumOfPrices(), ' ').toEqual(paymentInformationPage.getItemTotalPrice());
    expect(paymentInformationPage.getTotalWithTax(), ' ').toEqual(
      paymentInformationPage.countItemTotalWithoutTaxPlusTax()
    );

    await paymentInformationPage.clickFinishButton();

    const completePage = new CompletePage(page);
    await completePage.thanksTextIsVisible();
    await completePage.clickBackHomeButton();
  });
});

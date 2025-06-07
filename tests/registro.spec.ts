import { test, expect } from '@playwright/test';

test('TC-1 Verificar los elementos visuales en la pagina de registros', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.locator('input[name="firstName"]')).toBeVisible(); 
  await expect(page.locator('input[name="lastName"]')).toBeVisible();
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await expect(page.getByTestId('boton-registrarse')).toBeVisible();
  //await page.waitForTimeout(5000);
});

test('TC-2 Verificar boton registro esta inhabilitado por defecto' , async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.getByTestId('boton-registrarse')).toBeDisabled();
});

test('TC-3 Verificar boton registro se habilita al completar los campos' , async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.locator('input[name="firstName"]').fill('Juan')
  await page.locator('input[name="lastName"]').fill('Torres');
  await page.locator('input[name="email"]').fill('juan@email.com');
  await page.locator('input[name="password"]').fill('123456');
  await expect(page.getByTestId('boton-registrarse')).toBeEnabled();
});

test('TC-3 Verificar que el botón de registro se habilita al completar los campos obligatorios', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.locator('input[name="firstName"]').fill('Damisel')
  await page.locator('input[name="lastName"]').fill('Pozo');
  await page.locator('input[name="email"]').fill('dami@email.com');
  await page.locator('input[name="password"]').fill('123456');
  await expect(page.getByTestId('boton-registrarse')).toBeEnabled();
});

test('TC-4 Verificar redireccionamiento a página de inicio de sesión al hacer clic en el botón de registro', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByTestId('boton-login-header-signup').click();
  await expect(page).toHaveURL('http://localhost:3000/login');
});

test('TC-5 Verificar Registro exitoso con datos válidos', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.locator('input[name="firstName"]').fill('Juan');
  await page.locator('input[name="lastName"]').fill('Torres');
  await page.locator('input[name="email"]').fill('juantorres'+Date.now().toString()+'@email.com');
  await page.locator('input[name="password"]').fill('123456');
  await page.getByTestId('boton-registrarse').click();
  await expect(page.getByText('Registro exitoso')).toBeVisible();
});

test('TC-6 Verificar que un usuario no pueda registrarse con un correo electrónico ya existente', async ({ page }) => {
  const email = 'juantorres' + Date.now().toString() + '@email.com';
  await page.goto('http://localhost:3000/');
  await page.locator('input[name="firstName"]').fill('Juan');
  await page.locator('input[name="lastName"]').fill('Torres');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('123456');
  await page.getByTestId('boton-registrarse').click();
  await expect(page.getByText('Registro exitoso')).toBeVisible();
  await page.goto('http://localhost:3000/');
  await page.locator('input[name="firstName"]').fill('Juan');
  await page.locator('input[name="lastName"]').fill('Torres');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('123456');
  await page.getByTestId('boton-registrarse').click();
  await expect(page.getByText('Email already in use')).toBeVisible();
  await expect(page.getByText('Registro exitoso')).not.toBeVisible();
});

/*test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});*/

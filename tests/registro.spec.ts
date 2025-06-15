import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/registerPage';
import TestData from '../data/testData.json';

let registerPage: RegisterPage;

test.beforeEach(async ({ page }) => {
  registerPage = new RegisterPage(page);
  await registerPage.visitarPaginaRegistro();
});

test('TC-1 Verificar los elementos visuales en la pagina de registros', async ({ page }) => {
  await expect(page.locator('input[name="firstName"]')).toBeVisible();
  await expect(page.locator('input[name="lastName"]')).toBeVisible();
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await expect(page.getByTestId('boton-registrarse')).toBeVisible();
  //await page.waitForTimeout(5000);
});

test('TC-2 Verificar boton registro esta inhabilitado por defecto', async () => {
  await expect(registerPage.registerButton).toBeDisabled();
});

test('TC-3 Verificar boton registro se habilita al completar los campos', async () => {
  await registerPage.completarFormularioRegistro(TestData.usuarioValido);
  await expect(registerPage.registerButton).toBeEnabled();
});

test('TC-4 Verificar redireccionamiento a página de inicio de sesión al hacer clic en el botón de registro', async ({ page }) => {
  await registerPage.loginButton.click();
  await expect(page).toHaveURL('http://localhost:3000/login');
});

test('TC-5 Verificar Registro exitoso con datos válidos', async ({ page }) => {
  const uniqueEmail = generateUniqueEmail(TestData.usuarioValido.email);
  const usuario = { ...TestData.usuarioValido, email: uniqueEmail };

  await test.step('Completar el formulario de registro con datos válidos', async () => {
    await registerPage.completarYHacerClickBotonRegistro(usuario);
  });
  await expect(page.getByText('Registro exitoso')).toBeVisible();
});

test('TC-6 Verificar que un usuario no pueda registrarse con un correo electrónico ya existente', async ({ page }) => {
  const uniqueEmail = generateUniqueEmail(TestData.usuarioValido.email);
  const usuario = { ...TestData.usuarioValido, email: uniqueEmail };

  // Primer registro exitoso
  await registerPage.completarYHacerClickBotonRegistro(usuario);
  await expect(page.getByText('Registro exitoso')).toBeVisible();

  // Intento de registro con el mismo email
  await registerPage.visitarPaginaRegistro();
  await registerPage.completarYHacerClickBotonRegistro(usuario);
  await expect(page.getByText('Email already in use')).toBeVisible();
  await expect(page.getByText('Registro exitoso')).not.toBeVisible();
});

// Utilidad para generar un email único sin modificar TestData global
function generateUniqueEmail(baseEmail: string): string {
  const [local, domain] = baseEmail.split('@');
  return `${local}+${Date.now()}@${domain}`;
}


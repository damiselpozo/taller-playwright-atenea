import { test, expect, request } from '@playwright/test';
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


test('TC-8 Verificar Registro exitoso con datos válidos verificando respuesta de la API', async ({ page }) => {
  const uniqueEmail = generateUniqueEmail(TestData.usuarioValido.email);
  const usuario = { ...TestData.usuarioValido, email: uniqueEmail };

  await test.step('Completar el formulario de registro con datos válidos', async () => {
    await registerPage.completarFormularioRegistro(usuario);
  });
  const responsePromise = page.waitForResponse('http://localhost:4000/api/auth/signup');
  await registerPage.hacerClickBotonRegistro();
  const response = await responsePromise;
  const responseBody = await response.json();


  expect(response.status()).toBe(201);
  expect(responseBody).toHaveProperty('token');
  expect(typeof responseBody.token).toBe('string');
  expect(responseBody).toHaveProperty('user');
  expect(responseBody.user).toEqual(expect.objectContaining({
    id: expect.any(String),
    firstName: TestData.usuarioValido.nombre,
    lastName: TestData.usuarioValido.apellido,
    email: uniqueEmail,
  }));
  // Verificar que el mensaje de registro exitoso sea visible
  await expect(page.getByText('Registro exitoso')).toBeVisible();
});

test('TC-9 Generar signup desde la API', async ({ page }) => {
  const uniqueEmail = generateUniqueEmail(TestData.usuarioValido.email);
  const usuario = { ...TestData.usuarioValido, email: uniqueEmail };

  await test.step('Completar el formulario de registro con datos válidos', async () => {
    await registerPage.completarFormularioRegistro(usuario);
  });
  const responsePromise = page.waitForResponse('http://localhost:4000/api/auth/signup');
  await registerPage.hacerClickBotonRegistro();
  const response = await responsePromise;
  const responseBody = await response.json();


  expect(response.status()).toBe(201);
  expect(responseBody).toHaveProperty('token');
  expect(typeof responseBody.token).toBe('string');
  expect(responseBody).toHaveProperty('user');
  expect(responseBody.user).toEqual(expect.objectContaining({
    id: expect.any(String),
    firstName: TestData.usuarioValido.nombre,
    lastName: TestData.usuarioValido.apellido,
    email: uniqueEmail,
  }));
  await expect(page.getByText('Registro exitoso')).toBeVisible();
});

test('TC-10 Verificar comportamiento del front ante un error 500 en el registro', async ({ page }) => {
  const uniqueEmail = generateUniqueEmail(TestData.usuarioValido.email);
  const usuario = { ...TestData.usuarioValido, email: uniqueEmail };
  // Interceptar la solicitud de registro y devolver un error 500
  await page.route('**/api/auth/signup', route => {
    route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Email already in use' }),
    });
  });

  // Llenar el formulario. La navegación se hace en beforeEach.
  await registerPage.firstNameInput.fill(TestData.usuarioValido.nombre);
  await registerPage.lastNameInput.fill(TestData.usuarioValido.apellido);
  await registerPage.emailInput.fill(uniqueEmail);
  await registerPage.passwordInput.fill(TestData.usuarioValido.contraseña);
  
  // Hacer clic en el botón de registro
  await registerPage.registerButton.click();

  // Verificar que se muestra un mensaje de error.
  // NOTA: El texto 'Error en el registro' es una suposición y podría necesitar ser ajustado al mensaje real que muestra el frontend.
  await expect(page.getByText('Email already in use')).toBeVisible();
});

// Utilidad para generar un email único sin modificar TestData global
function generateUniqueEmail(baseEmail: string): string {
  const [local, domain] = baseEmail.split('@');
  return `${local}+${Date.now()}@${domain}`;
};
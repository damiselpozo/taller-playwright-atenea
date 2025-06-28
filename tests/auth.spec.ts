import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import TestData from '../data/testData.json';
import { DashboardPage } from '../pages/dashboardPage';

let loginPage: LoginPage;
let dashboardPage: DashboardPage;

test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.visitarPaginaLogin();
});

test('TC1.1 Login Exitoso y Redirección al Dashboard', async ({ page }) => {
    await loginPage.completarYHacerClickBotonLogin(TestData.usuarioValido);
    await expect(page.getByText('Inicio de sesión exitoso')).toBeVisible();
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
    await expect(dashboardPage.dashboardTitle).toBeVisible();
});

test('TC2.1 Intento de Login con Credenciales Inválidas', async ({ page }) => {
    await loginPage.completarYHacerClickBotonLogin(TestData.usuarioInValido);
    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expect(page.getByText('Inicio de sesión exitoso')).not.toBeVisible();
    await expect(page).toHaveURL('http://localhost:3000/login');
});

test('TC2.2 Intento de Login con Campos Vacíos', async ({ page }) => {
    await loginPage.hacerClickBotonLogin();
    await expect(page.getByText('Completa este campo')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
    await expect(page.getByText('Inicio de sesión exitoso')).not.toBeVisible();
    await expect(page).toHaveURL('http://localhost:3000/login');
});

test('TC2.3 Intento de Login con Email sin Contraseña', async ({ page }) => {
    await loginPage.completarYHacerClickBotonLogin(TestData.usuarioSinContrasena);
    await expect(page.getByText('Completa este campo')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
    await expect(page.getByText('Inicio de sesión exitoso')).not.toBeVisible();
    await expect(page).toHaveURL('http://localhost:3000/login');
});

test('TC2.4 Intento de Login con Formato de Email Incorrecto', async ({ page }) => {
    await loginPage.completarYHacerClickBotonLogin(TestData.usuarioEmailInvalido);
    await expect(page.getByText('Completa este campo')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
    await expect(page.getByText('Inicio de sesión exitoso')).not.toBeVisible();
    await expect(page).toHaveURL('http://localhost:3000/login');
});

test('TC3.1 Verificación del Enlace de Registro', async ({ page }) => {
    
    await expect(page.getByText('Completa este campo')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
    await expect(page.getByText('Inicio de sesión exitoso')).not.toBeVisible();
    await expect(page).toHaveURL('http://localhost:3000/login');
});

test('TC3.2 Cierre de Sesión y Protección de Rutas', async ({ page }) => {
    await loginPage.hacerClickBotonLogin();
    await expect(page.getByText('Completa este campo')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
    await expect(page.getByText('Inicio de sesión exitoso')).not.toBeVisible();
    await expect(page).toHaveURL('http://localhost:3000/login');
});
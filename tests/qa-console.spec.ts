import { expect, test } from '@playwright/test';

test('renders the QA console and switches panels', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'WebView QA Console' })).toBeVisible();
  await expect(page.getByTestId('runtime-overview')).toBeVisible();

  await page.getByRole('button', { name: /Insets/ }).click();
  await expect(page.getByTestId('safe-area-lab')).toBeVisible();

  await page.getByRole('button', { name: /Upload/ }).click();
  await expect(page.getByTestId('upload-panel')).toBeVisible();

  await page.getByRole('button', { name: /Logs/ }).click();
  await expect(page.getByRole('main').getByTestId('event-log')).toBeVisible();
});

test('runs storage checks and writes logs', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: /Storage/ }).click();
  await page.getByRole('button', { name: /Run Checks/ }).click();

  const storagePanel = page.getByTestId('storage-panel');
  await expect(storagePanel.getByText('localStorage')).toBeVisible();
  await expect(storagePanel.getByText('sessionStorage')).toBeVisible();
  await expect(storagePanel.getByText('IndexedDB')).toBeVisible();
});

test('runs navigation actions without leaving the app shell', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: /Navigation/ }).click();
  await page.getByRole('button', { name: 'pushState' }).click();

  await expect(page).toHaveURL(/qa-nav=push/);
  await expect(page.getByTestId('navigation-panel')).toBeVisible();
});

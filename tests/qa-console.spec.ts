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

test('reports a clipboard failure instead of claiming the QA report was copied', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    document.execCommand = () => false;
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Copy Report', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Could not copy QA report from header' })).toBeVisible();
  await page.getByRole('button', { name: /Logs/ }).click();

  const eventLog = page.getByRole('main').getByTestId('event-log');
  await expect(eventLog.getByText('Could not copy QA report from header')).toBeVisible();
  await expect(eventLog.getByText('Copied QA report from header')).toHaveCount(0);
});

test('legacy copy keeps keyboard focus and shows success beside the button', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    document.execCommand = () => true;
  });
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Copy Report', exact: true });
  await button.focus();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('status').filter({ hasText: 'Copied QA report from header' })).toBeVisible();
  await expect(button).toBeFocused();
});

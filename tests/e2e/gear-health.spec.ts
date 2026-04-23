import { expect, test } from "@playwright/test";

test("seeded demo navigation stays intact", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Open demo" })).toBeVisible();

  await page.getByRole("link", { name: "Open demo" }).click();
  await expect(page.getByRole("heading", { name: "Current replacement timing" })).toBeVisible();

  await page.getByRole("link", { name: "Alerts" }).first().click();
  await expect(page.getByRole("heading", { name: "Active service queue" })).toBeVisible();
});

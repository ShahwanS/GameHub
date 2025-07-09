// import { test, expect } from '@playwright/test';

// test.describe('Kniffel Game', () => {
//   // const roomCode = 'CF5I'; // No longer joining a specific room
//   const playerName = 'Tester'; // A unique name for the test player
//   const kniffelGameLobbyUrl = '/games/kniffel'; // The lobby page for Kniffel

//   test('should allow a player to create a room and roll dice', async ({ page }) => {
//     // 0. Navigate to the Kniffel game lobby
//     await page.goto(kniffelGameLobbyUrl);

//     // 1. Enter player name, create a new room, and wait for game to load
//     await expect(async () => {
//       const nameInput = page.getByPlaceholder('Your name');
//       await nameInput.fill(playerName);
//       await nameInput.blur();
//       await expect(nameInput).toHaveValue(playerName);

//       // Screenshot during retry attempt - after name fill/blur
//       await page.screenshot({ path: './tests-e2e/screenshots/kniffel-retry-after-name-fill.png' });

//       const createRoomButton = page.getByRole('button', { name: 'Create New Room' });
//       await expect(createRoomButton).toBeVisible();
//       await createRoomButton.click();

//       // Screenshot during retry attempt - after click
//       await page.screenshot({ path: './tests-e2e/screenshots/kniffel-retry-after-create-click.png' });

//       // The success condition: roll dice button is visible, meaning room creation worked.
//       const rollDiceButton = page.getByRole('button', { name: new RegExp(`^Roll Dice \\(\\d/3\\)`, 'i') });
//       await expect(rollDiceButton).toBeVisible({ timeout: 20000 }); 

//       // Also verify room code as part of successful room entry
//       const roomCodeLabel = page.getByText('Code:');
//       await expect(roomCodeLabel).toBeVisible({ timeout: 10000 });
//       const displayedRoomCode = roomCodeLabel.locator('+ span');
//       await expect(displayedRoomCode).toBeVisible();
//       await expect(displayedRoomCode).not.toBeEmpty();
//       console.log(`Retry attempt successful: Room code ${await displayedRoomCode.textContent()}`);

//     }).toPass(); // Default retries (Playwright default is 1 attempt, toPass adds more)

//     // If toPass() succeeded, we are in the game room.
//     await page.screenshot({ path: './tests-e2e/screenshots/kniffel-room-creation-final-success.png' });

//     // Verify a room code is displayed (This is now redundant if checked in toPass, but can be a final check)
//     // const roomCodeLabel = page.getByText('Code:');
//     // await expect(roomCodeLabel).toBeVisible({ timeout: 10000 });
//     // const displayedRoomCode = roomCodeLabel.locator('+ span');
//     // await expect(displayedRoomCode).toBeVisible();
//     // await expect(displayedRoomCode).not.toBeEmpty();

//     // 2. Roll Dice (rollDiceButton was already located and asserted as visible within toPass)
//     const rollDiceButton = page.getByRole('button', { name: new RegExp(`^Roll Dice \\(\\d/3\\)`, 'i') });
//     await expect(rollDiceButton).toHaveText(new RegExp(`Roll Dice \\(0/3\\)`, 'i'));
//     await rollDiceButton.click();

//     // Verify dice roll
//     await expect(rollDiceButton).toHaveText(new RegExp(`Roll Dice \\(1/3\\)`, 'i'), { timeout: 5000 });
//     const diceImages = page.locator('img[alt^="Dice showing"]');
//     await expect(diceImages).toHaveCount(5);
    
//     await page.screenshot({ path: './tests-e2e/screenshots/kniffel-game-dice-rolled.png' });
    
//     //leave room
//     const leaveButton = page.getByRole('button', { name: 'Leave' });
//     await expect(leaveButton.first()).toBeVisible({ timeout: 10000 });
//     await leaveButton.first().click();
    
//     // }).toPass(); // Temporarily commented out for debugging

//     //screenshot after leaving
//     await page.screenshot({ path: './tests-e2e/screenshots/kniffel-lobby-after-leave.png' });
//   });
// }); 
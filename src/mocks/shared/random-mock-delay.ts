export const MOCK_DELAY_MIN_MS = 300;
export const MOCK_DELAY_MAX_MS = 1500;

export function randomMockDelay(): number {
  return (
    Math.floor(Math.random() * (MOCK_DELAY_MAX_MS - MOCK_DELAY_MIN_MS + 1)) + MOCK_DELAY_MIN_MS
  );
}

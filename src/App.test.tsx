import { render, screen } from '@testing-library/react';
import App from './App';
import { test, expect } from 'vitest';

test('renders login page by default', async () => {
  render(<App />);
  const welcomeElement = await screen.findByText(/Vítejte zpět/i);
  expect(welcomeElement).toBeInTheDocument();
});

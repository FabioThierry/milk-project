import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Button from '../Button';

describe('Button Component', () => {
  it('renders correctly with the given children', () => {
    render(<Button>Click Me</Button>);
    const buttonElement = screen.getByText(/Click Me/i);
    expect(buttonElement).toBeTruthy();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    const buttonElement = screen.getByText(/Click Me/i);
    
    buttonElement.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

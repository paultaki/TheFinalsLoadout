import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import GameMarquee from './GameMarquee';

describe('GameMarquee', () => {
  it('renders with title and info text', () => {
    render(<GameMarquee title="Spin Selector" info="Pull the Lever" />);
    
    expect(screen.getByText('Spin Selector')).toBeInTheDocument();
    expect(screen.getByText('Pull the Lever')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const { container } = render(<GameMarquee title="Class Call" info="Spinning…" />);
    
    const wrapper = container.querySelector('.marquee-wrapper');
    expect(wrapper).toHaveClass('w-full', 'flex', 'justify-center', 'mt-2', 'pointer-events-none');
    
    const inner = container.querySelector('.marquee-inner');
    expect(inner).toHaveClass('animate-marqueePulse');
  });

  it('renders different title variants correctly', () => {
    const { rerender } = render(<GameMarquee title="Spin Selector" info="Test" />);
    expect(screen.getByText('Spin Selector')).toBeInTheDocument();
    
    rerender(<GameMarquee title="Class Call" info="Test" />);
    expect(screen.getByText('Class Call')).toBeInTheDocument();
    
    rerender(<GameMarquee title="Loadout Locked-In" info="Test" />);
    expect(screen.getByText('Loadout Locked-In')).toBeInTheDocument();
  });

  it('applies gradient text class to title', () => {
    render(<GameMarquee title="Spin Selector" info="Test" />);
    
    const title = screen.getByText('Spin Selector');
    expect(title).toHaveClass('gradient-text');
  });

  it('has correct inline styles for layout', () => {
    render(<GameMarquee title="Spin Selector" info="Test" />);
    
    const inner = document.querySelector('.marquee-inner') as HTMLElement;
    expect(inner.style.height).toBe('96px');
    expect(inner.style.maxWidth).toBe('480px');
    expect(inner.style.width).toBe('100%');
    expect(inner.style.display).toBe('grid');
    expect(inner.style.placeItems).toBe('center');
    expect(inner.style.gap).toBe('0.25rem');
  });
});
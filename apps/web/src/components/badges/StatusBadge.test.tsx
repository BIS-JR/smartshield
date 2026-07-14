import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders the Portuguese label for each known status', () => {
    render(<StatusBadge status="aprovado" />);
    expect(screen.getByText('APROVADO')).toBeInTheDocument();
  });

  it('falls back to the raw uppercased value for unknown statuses', () => {
    render(<StatusBadge status="desconhecido" />);
    expect(screen.getByText('DESCONHECIDO')).toBeInTheDocument();
  });
});

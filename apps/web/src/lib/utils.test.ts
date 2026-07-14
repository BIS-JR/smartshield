import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('joins truthy class names', () => {
    expect(cn('a', 'b', undefined, false, 'c')).toBe('a b c');
  });

  it('lets a later Tailwind class win over a conflicting earlier one', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});

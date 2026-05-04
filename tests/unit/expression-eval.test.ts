/**
 * Unit tests for popup-state expression evaluation.
 */
import { describe, it, expect } from 'vitest';
import { evaluateExpression } from '../../src/editor/popup-state';

describe('evaluateExpression', () => {
  it('evaluates power with both numeric', () => {
    expect(evaluateExpression('10', 'power', '6')).toBe('1000000');
  });

  it('evaluates multiply with both numeric', () => {
    expect(evaluateExpression('2', 'multiply', '100000')).toBe('200000');
  });

  it('evaluates subtract with both numeric', () => {
    expect(evaluateExpression('10', 'subtract', '1')).toBe('9');
  });

  it('evaluates add with both numeric', () => {
    expect(evaluateExpression('5', 'add', '3')).toBe('8');
  });

  it('evaluates divide with both numeric', () => {
    expect(evaluateExpression('10', 'divide', '3')).toBe('3');
  });

  it('evaluates min with both numeric', () => {
    expect(evaluateExpression('5', 'min', '3')).toBe('3');
  });

  it('evaluates max with both numeric', () => {
    expect(evaluateExpression('5', 'max', '3')).toBe('5');
  });

  it('keeps symbolic for variable subtract', () => {
    expect(evaluateExpression('N', 'subtract', '1')).toBe('N-1');
  });

  it('keeps symbolic for variable multiply', () => {
    expect(evaluateExpression('N', 'multiply', '2')).toBe('N*2');
  });
});

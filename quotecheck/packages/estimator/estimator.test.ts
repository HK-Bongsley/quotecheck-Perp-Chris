import { runEstimate } from './engine';
import type { EstimateInput } from '../types';

const testInput: EstimateInput = {
  categoryId: 1,
  areaId: 1,
  answers: {
    squareMeters: 40,
    access_issue: 'easy',
    condition: 'good',
    urgent: false
  }
};

test('basic painting estimate', () => {
  const result = runEstimate(testInput);
  expect(result.low).toBeGreaterThan(0);
  expect(result.typical).toBeGreaterThan(result.low);
  expect(result.high).toBeGreaterThan(result.typical);
  expect(result.confidence).toBe('medium');
});
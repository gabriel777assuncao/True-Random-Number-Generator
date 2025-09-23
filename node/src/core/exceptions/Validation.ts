import { ValidationError } from './Errors';

export function assertNumber(name: string, value: unknown): asserts value is number {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		throw new ValidationError(`${name} must be a valid number.`);
	}
}

export function assertInteger(name: string, value: number): void {
	if (!Number.isInteger(value)) {
		throw new ValidationError(`${name} must be an integer.`);
	}
}

export function assertMinLEMax(min: number, max: number): void {
	if (min > max) {
		throw new ValidationError('Min cannot be greater than Max.');
	}
}

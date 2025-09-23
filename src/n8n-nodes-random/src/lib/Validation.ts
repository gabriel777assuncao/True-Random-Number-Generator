export function assertNumber(name: string, value: unknown) {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		throw new Error(`${name} must be a valid number.`);
	}
}

export function assertInteger(name: string, value: number) {
	if (!Number.isInteger(value)) {
		throw new Error(`${name} must be an integer.`);
	}
}

export function assertMinLEMax(min: number, max: number) {
	if (min > max) {
		throw new Error('Min cannot be greater than Max.');
	}
}

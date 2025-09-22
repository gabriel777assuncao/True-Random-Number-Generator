export function assertNumber(name: string, v: unknown) {
	if (typeof v !== 'number' || !Number.isFinite(v)) {
		throw new Error(`${name} must be a valid number.`);
	}
}

export function assertInteger(name: string, v: number) {
	if (!Number.isInteger(v)) {
		throw new Error(`${name} must be an integer.`);
	}
}

export function assertMinLEMax(min: number, max: number) {
	if (min > max) {
		throw new Error('Min cannot be greater than Max.');
	}
}

import { IHttpClient } from '../interfaces/IHttpClient';

export class RandomOrgClient {
	constructor(
		private readonly http: IHttpClient,
		private readonly baseUrl = 'https://www.random.org/integers/',
	) { }

	async getInteger(min: number, max: number, timeoutMs = 10_000): Promise<number> {
		const body = await this.http.getText(this.baseUrl, {
			num: 1,
			min,
			max,
			col: 1,
			base: 10,
			format: 'plain',
			rnd: 'new',
		}, timeoutMs);

		const value = parseInt(body.trim(), 10);

		if (!Number.isFinite(value)) {
			throw new Error(`Unexpected Random.org response: "${body}"`);
		}

		return value;
	}
}

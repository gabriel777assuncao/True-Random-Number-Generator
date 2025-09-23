export interface HttpClient {
	getText(
		url: string,
		queryParameters?: Record<string, string | number>,
		timeoutMilliseconds?: number,
	): Promise<string>;
}

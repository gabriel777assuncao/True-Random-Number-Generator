export interface HttpClient {
	getText(url: string, qs?: Record<string, string | number>, timeoutMs?: number): Promise<string>;
}

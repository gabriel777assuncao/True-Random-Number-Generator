import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';

import { HttpClient } from './lib/HttpClient';
import { RandomOrgClient } from './lib/RandomOrgClient';
import { assertNumber, assertInteger, assertMinLEMax } from './lib/Validation';

export class Random implements INodeType
{
	description: INodeTypeDescription = {
		displayName: 'Random',
		name: 'random',
		icon: 'file:random.svg',
		group: ['transform'],
		version: 1,
		description: 'True Random Number Generator (Random.org)',
		defaults: { name: 'Random' },
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'True Random Number Generator',
				name: 'operation',
				type: 'hidden',
				default: 'trng',
				noDataExpression: true,
			},
			{
				displayName: 'Min',
				name: 'min',
				type: 'number',
				default: 1,
				description: 'Minimum integer (inclusive)',
			},
			{
				displayName: 'Max',
				name: 'max',
				type: 'number',
				default: 100,
				description: 'Maximum integer (inclusive)',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items: INodeExecutionData[] = this.getInputData();
		const promises: Array<Promise<INodeExecutionData>> = [];

		const httpClient: HttpClient = {
			getText: async (url, qs, timeoutMs = 10_000) =>
				(
                    await this.helpers.httpRequest({
					url,
					method: 'GET',
					json: false,
					encoding: 'text',
					headers: { Accept: 'text/plain' },
					qs,
					timeout: timeoutMs,
				}),
            ) as string,
		};

		const rng = new RandomOrgClient(httpClient);

		items.forEach((item: INodeExecutionData, i: number) => {
			const p = (async (): Promise<INodeExecutionData> => {
				try {
					const min = this.getNodeParameter('min', i) as number;
					const max = this.getNodeParameter('max', i) as number;

					assertNumber('Min', min);
					assertNumber('Max', max);
					assertInteger('Min', min);
					assertInteger('Max', max);
					assertMinLEMax(min, max);

					const value = await rng.getInteger(min, max);

					return { json: { value, min, max, source: 'random.org' } };
                } catch (error: unknown) {
                    if (error instanceof NodeOperationError) throw error;

                    throw new NodeApiError(this.getNode(), {
                        message: 'Failed to fetch a number from Random.org',
                        error: error instanceof Error ? error.message : 'Unknown error',
                        itemIndex: i,
                    });
                }
			})();

			promises.push(p);
		});

		const results = await Promise.all(promises);

		return [results];
	}
}

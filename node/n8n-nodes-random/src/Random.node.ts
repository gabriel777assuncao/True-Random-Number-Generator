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
import { ValidationError } from './lib/Errors';

export class Random implements INodeType {
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
		const inputItems: INodeExecutionData[] = this.getInputData();
		const outputPromises: Array<Promise<INodeExecutionData>> = [];

		const httpClient: HttpClient = {
			getText: async (
				url: string,
				queryStringParams?: Record<string, string | number>,
				timeoutMilliseconds = 10_000,
			) =>
				(await this.helpers.httpRequest({
					url,
					method: 'GET',
					json: false,
					encoding: 'text',
					headers: { Accept: 'text/plain' },
					qs: queryStringParams,
					timeout: timeoutMilliseconds,
				})) as string,
		};

		const randomOrgClient = new RandomOrgClient(httpClient);

		inputItems.forEach((_unusedItem: INodeExecutionData, itemIndex: number) => {
			const promise = (async (): Promise<INodeExecutionData> => {
				try {
					const minimum = this.getNodeParameter('min', itemIndex) as number;
					const maximum = this.getNodeParameter('max', itemIndex) as number;

					assertNumber('Min', minimum);
					assertNumber('Max', maximum);
					assertInteger('Min', minimum);
					assertInteger('Max', maximum);
					assertMinLEMax(minimum, maximum);

					const randomValue = await randomOrgClient.getInteger(minimum, maximum);

					return { json: { value: randomValue, min: minimum, max: maximum, source: 'random.org' } };
				} catch (caughtError: unknown) {
					if (caughtError instanceof NodeOperationError) throw caughtError;

					if (caughtError instanceof ValidationError) {
						throw new NodeOperationError(this.getNode(), caughtError.message, { itemIndex });
					}

					throw new NodeApiError(this.getNode(), {
						message: 'Failed to fetch a number from Random.org',
						error: caughtError instanceof Error ? caughtError.message : 'Unknown error',
						itemIndex,
					});
				}
			})();

			outputPromises.push(promise);
		});

		const results = await Promise.all(outputPromises);
		return [results];
	}
}

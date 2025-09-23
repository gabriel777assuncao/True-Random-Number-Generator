import { Random } from '../src/Random.node';
import { NodeOperationError, NodeApiError, INodeExecutionData } from 'n8n-workflow';

describe('Random node (TRNG via Random.org)', () => {
    const makeContext = (options?: {
        min?: number;
        max?: number;
        httpResponse?: string | Error;
    }) => {
        const {
            min = 1,
            max = 10,
            httpResponse = '7\n',
        } = options ?? {};

        const httpRequest = jest.fn().mockImplementation(async () => {
            if (httpResponse instanceof Error) throw httpResponse;
            return httpResponse;
        });

        const context: any = {
            getInputData: (): INodeExecutionData[] => [{ json: {} }],
            getNodeParameter: (name: string, _itemIndex: number) => {
                if (name === 'min') return min;
                if (name === 'max') return max;
                return undefined;
            },
            getNode: () => ({ name: 'Random' }),
            helpers: { httpRequest },
        };

        return { context, httpRequest };
    };

    test('should return a valid integer within the specified range', async () => {
        const node = new Random();
        const { context, httpRequest } = makeContext({ min: 1, max: 10, httpResponse: '7\n' });
        const [result] = await node.execute.call(context);

        expect(httpRequest).toHaveBeenCalledTimes(1);
        expect(result).toHaveLength(1);

        const item = result[0].json as any;
        expect(item).toMatchObject({
            value: 7,
            min: 1,
            max: 10,
            source: 'random.org',
        });
        expect(Number.isInteger(item.value)).toBe(true);
        expect(item.value).toBeGreaterThanOrEqual(1);
        expect(item.value).toBeLessThanOrEqual(10);
    });

    test('should throw NodeOperationError when Min or Max are strings', async () => {
        const node = new Random();
        const { context } = makeContext({ min: "a" as any, max: 10 });

        await expect(node.execute.call(context)).rejects.toBeInstanceOf(NodeOperationError);
    });

    test('should throw NodeApiError when Random.org request fails', async () => {
        const node = new Random();
        const { context } = makeContext({ min: 1, max: 10, httpResponse: new Error('network down') });

        await expect(node.execute.call(context)).rejects.toBeInstanceOf(NodeApiError);
    });
});

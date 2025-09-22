"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Random = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const RandomOrgClient_1 = require("./lib/RandomOrgClient");
const Validation_1 = require("./lib/Validation");
class Random {
    constructor() {
        this.description = {
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
    }
    async execute() {
        const items = this.getInputData();
        const promises = [];
        const httpClient = {
            getText: async (url, qs, timeoutMs = 10000) => (await this.helpers.httpRequest({
                url,
                method: 'GET',
                json: false,
                encoding: 'text',
                headers: { Accept: 'text/plain' },
                qs,
                timeout: timeoutMs,
            })),
        };
        const rng = new RandomOrgClient_1.RandomOrgClient(httpClient);
        items.forEach((item, i) => {
            const p = (async () => {
                try {
                    const min = this.getNodeParameter('min', i);
                    const max = this.getNodeParameter('max', i);
                    try {
                        (0, Validation_1.assertNumber)('Min', min);
                        (0, Validation_1.assertNumber)('Max', max);
                        (0, Validation_1.assertInteger)('Min', min);
                        (0, Validation_1.assertInteger)('Max', max);
                        (0, Validation_1.assertMinLEMax)(min, max);
                    }
                    catch (e) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), e.message, { itemIndex: i });
                    }
                    const value = await rng.getInteger(min, max);
                    return { json: { value, min, max, source: 'random.org' } };
                }
                catch (error) {
                    if (error instanceof n8n_workflow_1.NodeOperationError)
                        throw error;
                    throw new n8n_workflow_1.NodeApiError(this.getNode(), {
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
exports.Random = Random;

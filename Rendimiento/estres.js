import { options as baseOptions, setup, default as test } from './k6_test.js';

export { setup };
export default test;

export const options = {
    ...baseOptions,
    scenarios: {
        estres: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 50  },
                { duration: '30s', target: 100 },
                { duration: '30s', target: 150 },
                { duration: '30s', target: 0   },
            ],
        },
    },
};
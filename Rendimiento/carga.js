import { options as baseOptions, setup, default as test } from './k6_test.js';

export { setup };
export default test;

export const options = {
    ...baseOptions,
    scenarios: {
        carga: {
            executor: 'constant-vus',
            vus: 20,
            duration: '2m',
        },
    },
};
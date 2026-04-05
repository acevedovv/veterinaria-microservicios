import { options as baseOptions, setup, default as test } from './k6_test.js';

export { setup };
export default test;

export const options = {
    ...baseOptions,
    scenarios: {
        capacidad: {
            executor: 'ramping-vus',
            startVUs: 1,
            stages: [
                { duration: '30s', target: 10 },   // sube a 10 usuarios
                { duration: '30s', target: 25 },   // sube a 25
                { duration: '30s', target: 50 },   // sube a 50
                { duration: '30s', target: 0  },   // baja a 0
            ],
        },
    },
};
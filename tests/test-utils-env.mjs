import {setupTestContext} from "../test/setupTestContext.mjs";
import {createAppServicesInstance, ENV_NAME_PREFIX, ServicesContext} from "../injection/ServicesContext.mjs";
import {
    getEnvironment,
    getEnvValue,
    getEnvValueIndirect,
    getEnvValues,
    getNodeEnv, isProduction
} from "../injection/baseServices.mjs";
import {ENV_TEST} from "../env.mjs";

const {
    expect,
    test
} = setupTestContext();

test.describe('environment', () => {

    test.describe('no prefix', () => {
        let services, env;

        test.beforeEach(() => {
            env = {
                VAR_A: 'valueA',
                VAR_B: 'valueB',
                VAR_B_VAR: 'VAR_B',
                NODE_ENV: ENV_TEST
            };
            services = createAppServicesInstance({
                env
            });
        })

        test('should check if test env', ()=> {
            expect(isProduction(services)).to.be.false;
        })

        test('should get NODE_ENV', () => {
            expect(getNodeEnv(services)).to.eq(ENV_TEST);
        })

        test('should get environment', () => {
            expect(getEnvironment(services)).to.deep.eq(env);
        })

        test('should get variable value', () => {
            expect(getEnvValue(services, 'VAR_A')).to.eq('valueA');
        })

        test('should get variables values', () => {
            expect(getEnvValues(services, 'VAR_A', 'VAR_B')).to.deep.eq(['valueA', 'valueB']);
        })

        test('should get variable indirect', () => {
            expect(getEnvValueIndirect(services, 'VAR_B_VAR')).to.eq('valueB');
        })
    })

    test.describe('with prefix', () => {
        let services, env;

        test.beforeEach(() => {
            env = {
                toto_VAR_A: 'valueA',
                toto_VAR_B: 'valueB',
                toto_VAR_B_VAR: 'VAR_B',
                NODE_ENV: ENV_TEST
            };
            services = createAppServicesInstance({
                env,
                constants: {
                    [ENV_NAME_PREFIX]: 'toto'
                }
            });
        })

        test('should get NODE_ENV', () => {
            expect(getNodeEnv(services)).to.eq(ENV_TEST);
        })

        test('should get environment', () => {
            expect(getEnvironment(services)).to.deep.eq(env);
        })

        test('should get variable value', () => {
            expect(getEnvValue(services, 'VAR_A')).to.eq('valueA');
        })

        test('should get variables values', () => {
            expect(getEnvValues(services, 'VAR_A', 'VAR_B')).to.deep.eq(['valueA', 'valueB']);
        })

        test('should get variable indirect', () => {
            expect(getEnvValueIndirect(services, 'VAR_B_VAR')).to.eq('valueB');
        })
    })
})
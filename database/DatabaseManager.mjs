import {createConnectionPool as createConnectionPoolFct} from "./database.mjs";
import {bindOnAfterMethods} from "../utils/proxy.mjs";
import {isTrue} from "../utils/predicates.mjs";
import {getLogger} from "../utils/injection/services.mjs";
import {retry} from "../utils/functional.mjs";
import {ClientRetry} from "./ClientRetry.mjs";
import {ClientProfiler} from "./ClientProfiler.mjs";
import {ClientLogger} from "./ClientLogger.mjs";
import {beginTransact as beginTransactFct} from "./beginTransact.mjs";
import {queryRaw as queryRawFct} from "./queryRaw.mjs";
import {bindStatements as bindStatementsFct} from "./bindStatements.mjs";


export class DatabaseManager {
    constructor(env = process.env, {
        createConnectionPool = createConnectionPoolFct,
        beginTransact = beginTransactFct,
        bindStatements = bindStatementsFct,
        queryRaw = queryRawFct,
    } = {}) {
        this._pool = null;
        this._acquiredCount = 0;
        this._env = env;
        this._bindedStatements = null;
        this._rawStatements = null;
        this._database = null;
        this._transact = null;
        this._createConnectionPool = createConnectionPool;
        this._beginTransact = beginTransact;
        this._bindStatements = bindStatements;
        this._queryRaw = queryRaw;
    }

    get schema() {
        return this._env.ZUPFE_DATABASE_SCHEMA;
    }

    initialize() {
        const statements = this._bindedStatements;

        statements.queryRaw = async (query, args) => {
            const client = await this.acquireClient();
            try {
                return this._queryRaw(client, query, args, getLogger(this));
            } finally {
                client.release();
            }
        };

        statements.close = () => this.closeDBClientPool();

        statements.beginTransact = async () => {
            const client = await this.acquireClient();
            // bind statements with schema and client but do not auto-release client
            // as it will be reused in the current transaction.
            const statements = this._bindedStatements(this._rawStatements, this.schema, client);
            let transactManager = await this._beginTransact(client);

            let transact = {
                ...transactManager,
                ...statements,
                queryRaw: (query, args) => this._queryRaw(client, query, args, getLogger(this))
            };
            transact.isTransact = true;

            let self = this;
            transact = bindOnAfterMethods(transact,
                {
                    onCommit() {
                        self._transact = null;
                    },
                    onRollback() {
                        self._transact = null;
                    }
                });

            this._transact = transact;

            Object.defineProperty(this._transact, "schema", {
                enumerable: true,
                configurable: false,
                get: () => this.schema,
            });

            return transact;
        };

        statements.transact = async callback => {
            let transact = await statements.beginTransact();
            try {
                const result = await callback(transact);
                await transact.commit();
                return result;
            } catch (e) {
                await transact.rollback();
                throw e;
            }
        }

        this._database = statements;

        Object.defineProperty(this._database, "schema", {
            enumerable: true,
            configurable: false,
            get: () => this.schema,
        });

        return this;
    }

    getCurrentTransaction() {
        return this._transact;
    }

    getDatabase() {
        if (!this._database) {
            this.initialize();
        }
        return this._database;
    }

    connect() {
        this.getConnectionPool();
    }

    getConnectionPool() {
        if (this._pool === null) {
            getLogger(this).debug(`Creating database connection pool [${this.schema}]`);
            this._pool = this._createConnectionPool(this._env)

            this._pool.on('acquire', () => {
                this._acquiredCount++;
                getLogger(this).silly('Database client acquired [${this.schema}]: ' + this._acquiredCount);
            });
            this._pool.on('release', () => {
                this._acquiredCount--;
                getLogger(this).silly('Database client released [${this.schema}]: ' + this._acquiredCount);
            });
        }
        return this._pool;
    }

    async acquireClient() {
        try {
            let client = await retry(() => this.getConnectionPool().connect(), {
                retry: (error, i) => {
                    let isTooManyClients = error.code === '53300';
                    if (isTooManyClients) {
                        getLogger(this).debug(`Too many clients already, retrying(${i}) connection to database`);
                    }
                    return (isTooManyClients) && i < 3;
                }
            });
            client = new ClientRetry(client);
            if (isTrue(this._env.LOG_DATABASE_QUERIES)) {
                return new ClientLogger(client, getLogger(this));
            }
            return new ClientProfiler(client);
        } catch (e) {
            getLogger(this).debug(e);
            throw e;
        }
    }

    bindStatements(statements) {
        let schema = this.schema;
        this._rawStatements = statements;
        this._bindedStatements = this._bindStatements(statements, schema, () => this.acquireClient());
        return this;
    }

    async close() {
        // alias
        return this.closeDBClientPool();
    }

    async closeDBClientPool() {
        if (this._pool === null) return;
        await retry(() => {
            return this._acquiredCount === 0 &&
                this._pool.waitingCount === 0;
        }, {retry: 3});
        await this._pool.end();
        await retry(() => {
            return this._pool.idleCount === 0;
        }, {retry: 3});
        this._pool = null;
        this._acquiredCount = 0;
    }
}
import PG from 'pg';
import {ENV_TEST} from "../env.mjs";

const {Pool} = PG;

export const createConnectionPool = (env = {}) => {

    const {
        DATABASE_URL_VAR = process.env.DATABASE_URL_VAR,
        DATABASE_CONNECTION_STRING = process.env[DATABASE_URL_VAR] ?? env[DATABASE_URL_VAR],
        NODE_ENV = process.env.NODE_ENV
    } = env;

    let connectionString = DATABASE_CONNECTION_STRING;
    if (NODE_ENV === ENV_TEST) {
        connectionString += "?sslmode=disable";
    }

    return new Pool({
        connectionString,
        ssl: {
            rejectUnauthorized: false,
        }
    });
};

export async function tryInsertUnique(client, query, args) {
    while (true) {
        try {
            const res = await client.query(query, args);
            return res.rows[0];
        } catch (e) {
            if (e.code !== '23505') {
                throw e;
            }
        }
    }
}
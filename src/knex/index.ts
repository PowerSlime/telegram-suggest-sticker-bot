import Knex from "knex";
import configs from '../../knexfile';

const env = process.env.NODE_ENV as keyof typeof configs;

const knex = Knex(configs[env]);
export default knex;

require("dotenv").config();

export default {
  development: {
    client: "sqlite3",
    connection: {
      filename: "./dev.sqlite3"
    }
  },

  production: {
    client: "postgresql",
    connection: process.env.POSTGRESQL_URI,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  }
};

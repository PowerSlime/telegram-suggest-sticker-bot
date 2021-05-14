import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.table('stickers', tableBuilder => {
        tableBuilder.dateTime('created_at').defaultTo(knex.fn.now());
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.table('stickers', tableBuilder => {
        tableBuilder.dropColumn('created_at');
    });
}


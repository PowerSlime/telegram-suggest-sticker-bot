import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.table('words', tableBuilder => {
        tableBuilder.text('word').notNullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.table('words', tableBuilder => {
        tableBuilder.dropColumn('word');
    });
}


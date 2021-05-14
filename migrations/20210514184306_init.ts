import {Knex} from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('users', tableBuilder => {
        tableBuilder.increments('id');
    });

    await knex.schema.createTable('words', tableBuilder => {
        tableBuilder.increments('id');
        tableBuilder
            .integer('user_id')
            .notNullable()
            .references('id')
            .inTable('users')
            .onDelete('CASCADE');
    });

    await knex.schema.createTable('stickers', tableBuilder => {
        tableBuilder.increments('id');
        tableBuilder
            .integer('word_id')
            .notNullable()
            .references('id')
            .inTable('words')
            .onDelete('CASCADE');
        tableBuilder.text('sticker_id').notNullable();
        tableBuilder.text('sticker_file_id').notNullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('users');
    await knex.schema.dropTable('words');
    await knex.schema.dropTable('stickers');
}


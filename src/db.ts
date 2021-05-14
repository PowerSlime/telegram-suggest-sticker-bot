import knex from "./knex";
import {DbUser} from "./models/user";
import {DbWord} from "./models/word";

type StickerId = string;
type StickerFileId = string;
type UserId = number;
type Word = string;

class User {
    constructor(private readonly user: DbUser) {};

    private async getOrCreateWordId(word: Word): Promise<DbWord['id']> {
        const _word = await knex
            .table('words')
            .select('id')
            .where('word', word)
            .first();

        if (!_word) {
            const queryBuilder = await knex
                .table('words')
                .insert({ user_id: this.user.id, word })

            return queryBuilder[0];
        }

        return _word.id;
    }

    private async getSticker(wordId: DbWord['id'], stickerId: StickerId) {
        return knex
            .table('stickers')
            .select('sticker_id')
            .where('word_id', wordId)
            .andWhere('sticker_id', stickerId)
            .first();
    }

    async addSticker(word: Word, stickerId: StickerId, fileId: StickerFileId) {
        const wordId = await this.getOrCreateWordId(word);
        const sticker = await this.getSticker(wordId, stickerId);

        if (!sticker) {
            await knex
                .table('stickers')
                .insert({
                    word_id: wordId,
                    sticker_id: stickerId,
                    sticker_file_id: fileId
                });
        }
    }

    async removeSticker(word: Word, stickerId: StickerId) {
        await knex
            .table('stickers')
            .delete()
            .whereIn('word_id', function () {
                this.table('words').select('id').where('word', word)
            })
            .andWhere('sticker_id', stickerId);
    }

    async getWords(): Promise<Array<Word>> {
        const words = await knex
            .table('words')
            .distinct('word')
            .join('stickers', 'stickers.word_id', 'words.id')
            .where('user_id', this.user.id)
            .orderBy('word', 'asc');

        return words.map(w => w.word);
    }

    async getSuggestions(word: Word): Promise<Array<StickerFileId>> {
        const stickers = await knex
            .table('stickers')
            .select('sticker_file_id')
            .innerJoin('words', 'words.id', 'stickers.word_id')
            .where('user_id', this.user.id)
            .andWhere('words.word', word)
            .orderBy('created_at', 'desc')
            .limit(50);

        return stickers.map(s => s.sticker_file_id);
    }
}

class DB {
    async getOrCreateDbUser(userId: UserId): Promise<DbUser> {
        const user = await knex
            .table('users')
            .select('*')
            .where({
                id: userId,
            })
            .first();

        if (!user) {
            const createdUsers = await knex.table('users').insert({ id: userId });
            const createdUserId = createdUsers[0];
            return { id: createdUserId };
        }

        return user;
    }

    async getUser(userId: UserId): Promise<User> {
        const user = await this.getOrCreateDbUser(userId);
        return new User(user);
    }

    async addSticker(userId: UserId, word: Word, stickerId: StickerId, fileId: StickerFileId) {
        const user = await this.getUser(userId);
        await user.addSticker(word, stickerId, fileId);
    }

    async removeSticker(userId: UserId, word: Word, stickerId: StickerId): Promise<void> {
        const user = await this.getUser(userId);
        await user.removeSticker(word, stickerId);
    }

    async getWords(userId: UserId): Promise<Array<Word>> {
        const user = await this.getUser(userId);
        return user.getWords();
    }

    async getSuggestions(userId: UserId, word: Word): Promise<Array<StickerFileId>> {
        const user = await this.getUser(userId);
        return user.getSuggestions(word);
    }
}

const db = new DB();
export default db;

import {DbUser} from './src/models/user';
import {DbWord} from "./src/models/word";
import {DbSticker} from "./src/models/sticker";

declare module 'knex/types/tables' {
    interface Tables {
        users: DbUser;
        words: DbWord;
        stickers: DbSticker;
    }
}

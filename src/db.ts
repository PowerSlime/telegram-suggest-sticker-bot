type StickerId = string;
type StickerFileId = string;
type UserId = string;
type Word = string;

class User {
    private suggestions: Record<Word, Record<StickerId, StickerFileId>> = {};

    addSticker(word: Word, stickerId: StickerId, fileId: StickerFileId) {
        this.suggestions[word] = { [stickerId]: fileId, ...this.suggestions[word] }
    }

    removeSticker(word: Word, stickerId: StickerId) {
        const result = this.suggestions[word] || {};
        delete result[stickerId];

        const stickersCount = Object.keys(result).length;
        if (stickersCount === 0) {
            delete this.suggestions[word];
        } else {
            this.suggestions[word] = result;
        }
    }

    getWords(): Array<Word> {
        return Object.keys(this.suggestions);
    }

    getSuggestions(word: Word): Array<StickerFileId> {
        return Object.values(this.suggestions[word] || {});
    }

    cleanSuggestions() {
        this.suggestions = {};
    }
}

class DB {
    private db: Record<UserId, User> = {};

    getUser(userId: UserId): User {
        if (userId in this.db) {
            return this.db[userId]
        } else {
            const user = new User();
            this.db[userId] = user;
            return user;
        }
    }

    addSticker(userId: UserId, word: Word, stickerId: StickerId, fileId: StickerFileId) {
        const user = this.getUser(userId);
        user.addSticker(word, stickerId, fileId);
    }

    removeSticker(userId: UserId, word: Word, stickerId: StickerId) {
        const user = this.getUser(userId);
        user.removeSticker(word, stickerId);
    }

    getWords(userId: UserId): Array<Word> {
        const user = this.getUser(userId);
        return user.getWords();
    }

    getSuggestions(userId: UserId, word: Word): Array<StickerFileId> {
        const user = this.getUser(userId);
        return user.getSuggestions(word);
    }
}

const db = new DB();
export default db;

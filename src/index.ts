import {Telegraf, Scenes, session} from "telegraf";
import {InlineQueryResultCachedSticker} from "typegram";
import addWizard, {ADD_WIZARD_ID} from "./scenes/add";
import db from "./db";
import {v4 as uuid} from 'uuid';
import removeWizard, {REMOVE_WIZARD_ID} from "./scenes/remove";

require("dotenv").config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);
const stage = new Scenes.Stage([addWizard, removeWizard]);

const HELP_MESSAGE = `
Available commands:
/add - add new sticker to suggestions
/remove - remove sticker from suggestions
/list - list of words
/list word - list of stickers attached to the word
/help - returns this message
`.trim();

bot.use(session());
// @ts-ignore
bot.use(stage.middleware());

bot.command('start', (ctx) => {
    ctx.reply(HELP_MESSAGE)
});

bot.command('help', (ctx) => {
    ctx.reply(HELP_MESSAGE);
});

bot.command('quit', (ctx) => {
    ctx.leaveChat();
});

bot.command('add', (ctx) => {
    // @ts-ignore
    ctx.scene.enter(ADD_WIZARD_ID);
});

bot.command('remove', (ctx) => {
    // @ts-ignore
    ctx.scene.enter(REMOVE_WIZARD_ID);
});

bot.hears(/\/list(.*)/, async (ctx) => {
    const userId = ctx.from.id;
    const word = ctx.match[1].trim();

    if (!word) {
        const words = await db.getWords(userId);
        if (words.length > 0) {
            const text = words.map(word => `- ${word}`).join('\n');
            return ctx.reply(`Available suggestions: \n${text}`);
        } else {
            return ctx.reply('No any available suggestions. Try to /add new one.')
        }
    }

    const stickers = await db.getSuggestions(userId, word);
    if (stickers.length > 0) {
        stickers.forEach((stickerId) => {
            ctx.replyWithSticker(stickerId);
        });
    } else {
        ctx.reply('No attached stickers to that word');
    }
});

bot.on('message', (ctx) => {
    ctx.reply('Unknown command, I guess /help will help you');
});

bot.on('inline_query', async (ctx) => {
    const userId = ctx.from.id;
    const word = ctx.inlineQuery.query;
    const stickers = await db.getSuggestions(userId, word);

    const result: Array<InlineQueryResultCachedSticker> = stickers.map((stickerId) => ({
        type: "sticker",
        id: uuid(),
        sticker_file_id: stickerId
    }));

    return ctx.answerInlineQuery(result);
});

(async () => {
    if (process.env.NODE_ENV === 'development') {
        console.log('Bot is started.');
        bot.launch();
    } else {
        const port = parseInt(process.env.PORT || "5000");

        console.log(`Bot is started in webhook mode on port ${port}.`);
        bot.launch({
            webhook: {
                domain: process.env.TELEGRAM_WEBHOOK_URL,
                port: port,
            }
        })
    }
})();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

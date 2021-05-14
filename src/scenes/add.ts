import {Composer, Scenes} from "telegraf";
import db from "../db";

export const ADD_WIZARD_ID = 'ADD_WIZARD';

interface Session extends Scenes.WizardSessionData {
    word: string;
}

type AddStickerContext = Scenes.WizardContext<Session>

const wordAddStep = new Composer<AddStickerContext>();
wordAddStep.on('message', ctx => {
    // @ts-ignore
    const word = ctx.message.text;

    if (word) {
        ctx.scene.session.word = word;

        ctx.reply('Send stickers. \nWhen you will want to finish just send /finish command');
        ctx.wizard.next();
    } else {
        ctx.reply('Please, enter the word');
    }
});

const stickerAddStep = new Composer<AddStickerContext>();
stickerAddStep.command('finish', ctx => {
    ctx.reply('Done. You can type /list command to see the updates');
    ctx.scene.leave();
});
stickerAddStep.on('message', async ctx => {
    // @ts-ignore
    const fileId = ctx.message.sticker?.file_id;
    // @ts-ignore
    const stickerId = ctx.message.sticker?.file_unique_id;

    if (stickerId) {
        const userId = ctx.message.from.id;

        const word = ctx.scene.session.word;
        await db.addSticker(userId, word, stickerId, fileId);
    }
});


const addWizard = new Scenes.WizardScene(
    ADD_WIZARD_ID,
    ctx => {
        ctx.reply('Please, enter the word');
        ctx.wizard.next();
    },
    wordAddStep,
    stickerAddStep,
)

export default addWizard;

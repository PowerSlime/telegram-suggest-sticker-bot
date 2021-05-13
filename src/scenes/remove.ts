import {Composer, Scenes} from "telegraf";
import db from "../db";

export const REMOVE_WIZARD_ID = 'REMOVE_WIZARD';

interface Session extends Scenes.WizardSessionData {
    word: string;
}

type RemoveStickerContext = Scenes.WizardContext<Session>;
const wordRemoveStep = new Composer<RemoveStickerContext>();
wordRemoveStep.on('message', ctx => {
    // @ts-ignore
    const word = ctx.message.text;

    if (word) {
        ctx.scene.session.word = word;

        ctx.reply('Send stickers. \nWhen you will want to finish just send /finish command');
        ctx.wizard.next();
    } else {
        ctx.reply('Please send word');
    }
});

const stickerRemoveStep = new Composer<RemoveStickerContext>();
stickerRemoveStep.command('finish', ctx => {
    ctx.reply('Done. You can type /list command to see the updates');
    ctx.scene.leave();
});
stickerRemoveStep.on('message', ctx => {
    // @ts-ignore
    const stickerId = ctx.message.sticker?.file_unique_id;

    if (stickerId) {
        const userId = `${ctx.message.from.id}`;

        const word = ctx.scene.session.word;
        db.removeSticker(userId, word, stickerId);
    }
});

const removeWizard = new Scenes.WizardScene(
    REMOVE_WIZARD_ID,
    ctx => {
        ctx.reply('Please, enter the word');
        ctx.wizard.next();
    },
    wordRemoveStep,
    stickerRemoveStep,
);

export default removeWizard;

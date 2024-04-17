const { Telegraf, Markup, session } = require('telegraf');

require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN; // Bu yerga bot tokeningizni qo'ying
const bot = new Telegraf(BOT_TOKEN);

const sessionStore = {};

bot.start((ctx) => {
    ctx.reply(
        'Salom! Iltimos, quyidagi baholash mezonlaridan birini tanlang:',
        Markup.inlineKeyboard([
            [Markup.button.callback('😠', 'rate_1'), Markup.button.callback('😕', 'rate_2')],
            [Markup.button.callback('😐', 'rate_3'), Markup.button.callback('😊', 'rate_4')],
            [Markup.button.callback('😍', 'rate_5')]
        ])
    );
});

bot.action(/rate_(\d+)/, (ctx) => {
    const rating = ctx.match[1];
    const emojiMap = {
        '1': '😠',
        '2': '😕',
        '3': '😐',
        '4': '😊',
        '5': '😍'
    };
    const selectedEmoji = emojiMap[rating];
    const userId = ctx.from.id;

    // Sessiyaga tanlangan emoji va izoh kutish holatini saqlaymiz
    sessionStore[userId] = { emoji: selectedEmoji, awaitingFeedback: rating !== '5' };

    if (rating === '5') {
        ctx.editMessageText(`Siz ${selectedEmoji} tanladingiz. Rahmat!`);
    } else {
        ctx.editMessageText(`Siz ${selectedEmoji} tanladingiz. Endi izoh yozishingiz mumkin.`);
    }
});

bot.on('text', (ctx) => {
    const userId = ctx.from.id;

    // Agar foydalanuvchi izoh kutayotgan bo'lsa, izohni qaytarib beramiz
    if (sessionStore[userId] && sessionStore[userId].awaitingFeedback) {
        const emoji = sessionStore[userId].emoji;
        ctx.replyWithHTML(`Sizning izohingiz: <code>${ctx.message.text}</code> ${emoji}`);
        // Izoh olgandan keyin, sessiya ma'lumotlarini o'chiramiz
        delete sessionStore[userId];
    }
});

bot.launch();

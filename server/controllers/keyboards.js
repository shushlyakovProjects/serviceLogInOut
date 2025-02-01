module.exports = {
    buttonsForCopyToken: {
        reply_markup: JSON.stringify({
            inline_keyboard: [[{
                text: 'Скопировать токен восстановления',
                callback_data: 'copyToken'
            }]]
        })
    },
    buttonsForPassword: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: 'Да, все верно!', callback_data: 'passIsCorrect' }, {
                    text: 'Нет, ошибся...', callback_data: 'passIsIncorrect'
                }],
                [{
                    text: 'Я вспомнил пароль! (Отмена)', callback_data: 'cancel'
                }],
            ]
        })
    },
    buttonsForStartGuesser: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    { text: 'Загадал!', callback_data: 'start_guesser' },
                    { text: 'Давай завершим', callback_data: 'stop_guesser' }
                ],
            ]
        })
    },
    buttonsForPlayingGuesser: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    { text: 'Угадал!', callback_data: 'finish_guesser' },
                ],
                [
                    { text: 'Больше', callback_data: 'more_guesser' },
                    { text: 'Меньше', callback_data: 'less_guesser' }
                ],
                [
                    { text: 'Давай завершим', callback_data: 'stop_guesser' },
                ],
            ]
        })
    },
    buttonsForMusic: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    { text: 'Супер!', callback_data: 'mood_good' },
                ],
                [
                    { text: 'Так себе, улучшишь?', callback_data: 'mood_middle' },
                ],
                [
                    { text: 'Грустненько :(', callback_data: 'mood_sad' },
                ],
            ]
        })
    }
}
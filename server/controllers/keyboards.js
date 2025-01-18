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
    }
}
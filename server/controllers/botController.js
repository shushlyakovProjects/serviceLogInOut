const express = require('express')
const bcrypt = require('bcryptjs') // Пакет для хеширования паролей
const jwt = require('jsonwebtoken')  // Пакет для генерации токена
const ncp = require('copy-paste') // Пакет для копирования инфромации в буфер
const TelegramApi = require('node-telegram-bot-api') // Пакет для работы с Api BOT
const fs = require('fs')

const connectionDB = require('./connectionDB')
const { SECRET_RECOVERY_KEY, SECRET_IDENTIFICATION_KEY, dirname_server } = require('../config')
const {
    buttonsForPassword,
    buttonsForCopyToken,
    buttonsForStartGuesser,
    buttonsForPlayingGuesser,
    buttonsForMusic } = require('./keyboards')

// Создание роутера, который обрабатывает /recoveryPass
const router = express.Router()
router.post('/', (req, res) => {
    const { login } = req.body
    const SQL_QUERY = `SELECT * FROM users_list WHERE login='${login}'`
    connectionDB.query(SQL_QUERY, async (err, result) => {
        if (err) { res.status(500).send('База данных недоступна') }
        else {
            if (result.length == 0) { res.status(400).send('Данный login не найден') }
            else {
                const USER = result[0]
                if (!USER.recovery_token) { res.status(501).send('Данный аккаунт не настроен на восстановление') }
                else {

                    const { chatId, identificationToken } = jwt.verify(USER.recovery_token, SECRET_RECOVERY_KEY)

                    const { login } = jwt.verify(identificationToken, SECRET_IDENTIFICATION_KEY)

                    currentLogin = login
                    currentTopic = `Смена пароля`

                    await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/a6f/1ae/a6f1ae15-7c57-3212-8269-f1a0231ad8c2/1.webp')
                    await bot.sendMessage(chatId, 'Забыли пароль?')
                    await bot.sendMessage(chatId, 'Не беда! Сейчас восстановим...')
                    await bot.sendMessage(chatId, `Я обнаружил, что данный запрос отправлен с аккаунта '${login}'`)
                    await bot.sendMessage(chatId, '❗️❗️❗️Если это были не вы, проигнорируйте данное сообщение!')

                    setTimeout(async () => { await bot.sendMessage(chatId, 'Если это вы, укажите новый пароль для данного аккаунта:') }, 3000)

                    res.status(200).send('Сообщение о восстановлении отправлено в Telegram')
                }
            }
        }
    })
})
module.exports = router

// ------------------------------------------------------------------------------------

// Токен настройки бота
const BOT_TOKEN = '7701017604:AAGHWpM-DPXhtLgsuZNYC4vfkc5F1J4TtmY'

// Создаем экземпляр бота
const bot = new TelegramApi(BOT_TOKEN, { polling: true })

// Переменные
let currentTopic = '' // Текущая тема разговора
let recoveryToken = '' // Токен восстановления
let newPass = '' // Новый пароль (для восстановления)
let currentLogin = '' // Логин пользователя (который восстанавливает пароль)
let guesser = {
    left: 1,
    right: 1001,
    resultNumber: 0,
    attempts: 0,
}

// Функция генерации токена восстановеления
function generateRecoveryToken(chatId, identificationToken) {
    const payload = { chatId, identificationToken }
    return jwt.sign(payload, SECRET_RECOVERY_KEY)
}

// Функция по запуску и настройке бота
function startBot() {
    // Команды бота
    bot.setMyCommands([
        { command: '/start', description: 'Познакомимся!' },
        { command: '/getinfo', description: 'Получить ID чата' },
        { command: '/getrecoverytoken', description: 'Получить токен восстановления' },
        { command: '/start_guesser', description: 'Угадай моё число!' },
        { command: '/get_music', description: 'Давай послушаем музыку' },
    ])

    bot.on('message', async (msg) => {
        const message = msg.text
        const chatId = msg.chat.id

        if (message == '/start') { return await bot.sendMessage(chatId, `Привет! Я бот по восстановлению паролей`) }

        if (message == '/getinfo') { return await bot.sendMessage(chatId, chatId) }

        if (message == '/getrecoverytoken') {
            currentTopic = 'Создание токена восстановления'
            return await bot.sendMessage(chatId, 'Для создания уникального токена восстановления, пожалуйста, укажите ваш токен идентификации:')
        }

        // Игра = "Угадай число"
        if (message == '/start_guesser') {
            currentTopic = 'Угадываем число'
            await bot.sendMessage(chatId, `Спорим, я угадаю твоё число за 10 попыток?`)
            await bot.sendMessage(chatId, `Загадай число от 1 до 1000`)
            setTimeout(() => { bot.sendMessage(chatId, `Загадал?`, buttonsForStartGuesser) }, 1500)
            return await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/a6f/1ae/a6f1ae15-7c57-3212-8269-f1a0231ad8c2/1.webp')
        }

        // Функция = "Слушаем музыку"
        if (message == '/get_music') {
            currentTopic = 'Слушаем музыку'
            await bot.sendMessage(chatId, 'А давай!')
            return await bot.sendMessage(chatId, `Какое у вас настроение?`, buttonsForMusic)
        }

        // Тема = Создание токена восстановления
        if (currentTopic == 'Создание токена восстановления') {
            currentTopic = ''
            recoveryToken = generateRecoveryToken(chatId, message)
            await bot.sendMessage(chatId, 'Ваш токен восстановления: ' + recoveryToken, buttonsForCopyToken)
            return await bot.sendMessage(chatId, 'Укажите данный токен в личном кабинете для восстановления пароля в будущем!')
        }

        // Тема = Смена пароля
        if (currentTopic == 'Смена пароля') {
            newPass = message
            return await bot.sendMessage(chatId, `Ваш новый пароль '${message}'. Все верно?`, buttonsForPassword)
        }


        // Неизвестная команда
        return await bot.sendSticker(chatId, 'https://cdn.tlgrm.ru/stickers/a6f/1ae/a6f1ae15-7c57-3212-8269-f1a0231ad8c2/16.webp')
            .then(() => { bot.sendMessage(chatId, `Неизвестная команда...`) })
    })

    // Реакция на Telegram-кнопки
    bot.on('callback_query', async (msg) => {
        const data = msg.data
        const chatId = msg.message.chat.id

        // Кнопка = Копировать токен
        if (data == 'copyToken') {
            ncp.copy(recoveryToken, async () => { return await bot.sendMessage(chatId, 'Токен скопирован. Удачи!') })
        }
        // Тема = Смена пароля
        if (currentTopic == 'Смена пароля') {
            if (data == 'passIsCorrect') {
                // Хешируем пароль
                const hashPass = bcrypt.hashSync(newPass, 5);
                const SQL_QUERY = `UPDATE users_list SET password='${hashPass}' WHERE users_list.login='${currentLogin}'`
                // Меняем пароль у пользователя в базе
                connectionDB.query(SQL_QUERY, (err, result) => {
                    if (err) { bot.sendMessage(chatId, 'База данных недоступна :(('); console.log(err); }
                    else { return bot.sendMessage(chatId, `Пароль успешно изменен!`) }
                })
                currentTopic = '';
            }
            if (data == 'passIsIncorrect') { bot.sendMessage(chatId, 'Повторите попытку...') }
            if (data == 'cancel') { currentTopic = ''; bot.sendMessage(chatId, 'Супер! Запиши😁') }
        }
        // Тема = Угадываем число
        if (currentTopic == 'Угадываем число') {
            if (data == 'start_guesser') {
                guesser.resultNumber = Math.floor((guesser.right - guesser.left) / 2)
                guesser.attempts++
                return bot.sendMessage(chatId, `Окей, начинаем! Твоё число ${guesser.resultNumber}?`, buttonsForPlayingGuesser)
            }
            if (data == 'finish_guesser') {
                return bot.sendMessage(chatId, `Твоё чило: ${guesser.resultNumber}\nПопыток:${guesser.attempts}`)
                    .then(() => {
                        currentTopic = ''
                        guesser = { left: 1, right: 1001, resultNumber: 0, attempts: 0, }
                    })
            }
            if (data == 'less_guesser') {
                guesser.right = guesser.resultNumber
                let middle = Math.floor((guesser.right - guesser.left) / 2)
                guesser.resultNumber = guesser.left + middle
                guesser.attempts++
                if (guesser.attempts == 10) {
                    return bot.sendMessage(chatId, `Твоё чило: ${guesser.resultNumber}\nПопыток:${guesser.attempts}`)
                        .then(() => {
                            currentTopic = ''
                            guesser = { left: 1, right: 1001, resultNumber: 0, attempts: 0, }
                        })
                }
                return bot.sendMessage(chatId, `Твоё число ${guesser.resultNumber}?`, buttonsForPlayingGuesser)
            }
            if (data == 'more_guesser') {
                guesser.left = guesser.resultNumber
                let middle = Math.floor((guesser.right - guesser.left) / 2)
                guesser.resultNumber = guesser.left + middle
                guesser.attempts++
                if (guesser.attempts == 10) {
                    return bot.sendMessage(chatId, `Твоё чило: ${guesser.resultNumber}\nПопыток:${guesser.attempts}`)
                        .then(() => {
                            currentTopic = ''
                            guesser = { left: 1, right: 1001, resultNumber: 0, attempts: 0, }
                        })
                }
                return bot.sendMessage(chatId, `Твоё число ${guesser.resultNumber}?`, buttonsForPlayingGuesser)
            }
            if (data == 'stop_guesser') {
                return bot.sendMessage(chatId, 'Игра завершена, приходи ещё!')
                    .then(() => {
                        currentTopic = ''
                        guesser = { left: 1, right: 1001, resultNumber: 0, attempts: 0, }
                    })
            }
        }

        // Тема = Слушаем музыку
        if (currentTopic == 'Слушаем музыку') {
            const url = dirname_server + '/static/music/' + data
            const songs = fs.readdirSync(url)
            const random = Math.round(Math.random() * (songs.length - 1) + 1) - 1;
            
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/a6f/1ae/a6f1ae15-7c57-3212-8269-f1a0231ad8c2/14.webp')
            return await bot.sendAudio(chatId, url + '/' + songs[random])
        }
    })
}

// Запуск бота
startBot()
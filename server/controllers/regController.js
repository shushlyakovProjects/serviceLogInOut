const express = require('express')
const router = express.Router()

const bcrypt = require('bcryptjs') // Пакет для хеширования паролей
const jwt = require('jsonwebtoken')  // Пакет для генерации токена
const connectionDB = require('./connectionDB')

// Импорт секретного ключа идентификации
const {SECRET_IDENTIFICATION_KEY} = require('../config')

function generateIdentificationToken(login, hashPass){
    const payload = {
        login, hashPass
    }
    return jwt.sign(payload, SECRET_IDENTIFICATION_KEY)
}


// Реакция на /registration
router.post('/', (request, response) => {
    // Достаем данные из запроса
    const { login, password, surname, name } = request.body

    // Проверка на существование данного логина
    const checkQuery = `SELECT * FROM users_list WHERE login = '${login}'`

    // Отправляем запрос в БД
    connectionDB.query(checkQuery, (err, result) => {
        // Проверяем наличие ошибок
        if (err) { response.status(500).send('База данных недоступна') }
        // Если ошибок нет, идем дальше
        else {
            // Если результат > 0, то логин занят
            if (result.length > 0) {
                response.status(501).send('Данный login уже занят')
            }
            // Если результат пустой, то выполняем регистрацию
            else {

                const salt = bcrypt.genSaltSync(5) // Генерируем соль
                const hashPass = bcrypt.hashSync(password, salt) // Хешируем пароль

                // SQL-запрос на добавление новой записи в БД
                const registrationQuery = `INSERT INTO users_list (id, login, password, surname, name, identification_token)
                    VALUES (NULL, '${login}', '${hashPass}', '${surname}', '${name}', '${generateIdentificationToken(login, hashPass)}')`

                // Отправка SQL-запроса
                connectionDB.query(registrationQuery, (err, result) => {
                    if (err) { response.status(500).send(err) }
                    else { response.status(200).send('Регистрация выполнена') }
                })
            }
        }
    })
})

module.exports = router
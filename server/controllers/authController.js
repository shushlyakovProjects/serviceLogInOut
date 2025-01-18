const express = require('express')
const router = express.Router()

const bcrypt = require('bcryptjs') // Пакет для хеширования паролей
const jwt = require('jsonwebtoken')  // Пакет для генерации токена
const connectionDB = require('./connectionDB')


const { SECRET_ACCESS_KEY } = require('../config')
// Функция генерации токена
function generateAccessToken(id, role) {
    const payload = {
        id, role
    }
    return jwt.sign(payload, SECRET_ACCESS_KEY, { expiresIn: "24h" })
}


// Реакция на /authorization
router.post('/', (request, response) => {
    // Если токен уже есть
    if (request.cookies.ACCESS_TOKEN) {
        // Токен доступа обнаружен, значит пользователь уже проходил авторизацию
        const token = request.cookies.ACCESS_TOKEN
        // Проверяем действительность токена
        const decodeData = jwt.verify(token, SECRET_ACCESS_KEY)
        // Достаем данные из токена
        const { id, role } = decodeData
        if (role == 'admin') {
            // Выдаем данные админа ...
        } else {
            // Выдаем данные базового пользователя
            const findUserQuery = `SELECT * FROM users_list WHERE id = '${id}'`
            connectionDB.query(findUserQuery, (err, result) => {
                if (err) { response.status(500).send('Пользователь не найден в базе') }
                else {
                    response.status(200).json(result)
                }
            })
        }
    } else {
        // Авторизация впервые (токена нет!)
        // Достаем данные из запроса
        const { login, password } = request.body

        // Подготавливаем SQL-запрос на проверку существования пользователя
        const checkQuery = `SELECT * FROM users_list WHERE login = '${login}'`

        // Запускаем запрос на проверку
        connectionDB.query(checkQuery, (err, result) => {
            // Если ошибка, то отвечаем на клиент
            if (err) { response.status(500).send('База данных недоступна') }
            // Если ошибок нет, идем дальше
            else {
                // Проверяем result. Если логин найден, то идентификация выполнена
                if (result.length > 0) {
                    // Идентификация выполнена! ~~~~~~~~~~~~~~~~~~~~
                    const candidate = result[0]
                    // Проверка пароля
                    if (bcrypt.compareSync(password, candidate.password)) {
                        // Аутентификация выполнена! ~~~~~~~~~~~~~~~~~~~~
                        const token = generateAccessToken(candidate.id, candidate.role)
                        response.cookie('ACCESS_TOKEN', token, { maxAge: 86400000 }).status(200).json(candidate)
                        // Авторизация выполнена! ~~~~~~~~~~~~~~~~~~~~
                    } else {
                        response.status(501).send('Пароль неверный')
                    }
                } else {
                    response.status(501).send('Данный login не найден')
                }
            }
        })
    }
})

module.exports = router
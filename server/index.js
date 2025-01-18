const express = require('express')
const cookieParser = require('cookie-parser') // Пакет для парсинга cookies

const app = express()

app.use(express.json()) // Для корректного чтения JSON
app.use(cookieParser()) // Для корректного чтения Cookies

// Импорт контроллеров
const connectionDB = require('./controllers/connectionDB')
const regConroller = require('./controllers/regController')
const authController = require('./controllers/authController')
const botController = require('./controllers/botController')

// Базовый url
app.get('/', (req, res) => { res.send('<h1>Server is running...</h1>') })

// Перенаправление запросов в Conroller
app.use('/registration', regConroller)
app.use('/authorization', authController)
app.use('/recoveryPass', botController)

// Обновление токена восстановления
app.post('/updateRecoveryToken', (req, res) => {
    const { userId, recoveryToken } = req.body
    const SQL_QUERY = `UPDATE users_list SET recovery_token='${recoveryToken}' WHERE id='${userId}'`
    connectionDB.query(SQL_QUERY, (err, result) => {
        if (err) { res.status(500).send('База данных недоступна') }
        else { res.status(200).send('Токен восстановления установлен') }
    })
})



const PORT = 3000
app.listen(PORT, () => { console.log(`Server is running on localhost:${PORT}`); })
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
const { socketHandling, notifyClients, getDateNow } = require('./controllers/socketController')

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
// Фиксация нового сообщения в базу
app.post('/sendMessage', (req, res) => {
    const { message, sender_id, sender_login } = req.body
    const SQL_QUERY = `INSERT INTO general_chat (id, sender_id, sender_login, message, date) VALUE (null, '${sender_id}','${sender_login}','${message}','${getDateNow()}')`
    connectionDB.query(SQL_QUERY, (err, result) => {
        if (err) { res.status(500).send('База данных недоступна') }
        else {
            notifyClients(io, { message, sender_id, sender_login, date: getDateNow() })
            res.status(200).send('Сообщение успешно доставлено')
        }
    })
})


// Настройка ВЕБ-СОКЕТА
const http = require('http')
const socketIo = require('socket.io')
const server = http.createServer(app)
const io = socketIo(server)
io.on('connection', (socket) => { socketHandling(socket, io) })








const WEBSOCKET_PORT = 4000
server.listen(WEBSOCKET_PORT, () => { console.log('Socket.io is running on port 4000'); })

const PORT = 3000
app.listen(PORT, () => { console.log(`Server is running on localhost:${PORT}`); })
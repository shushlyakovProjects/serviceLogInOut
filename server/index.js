const express = require('express')
const cookieParser = require('cookie-parser') // Пакет для парсинга cookies
const fileUpload = require('express-fileupload')

const app = express()

app.use(express.json()) // Для корректного чтения JSON
app.use(cookieParser()) // Для корректного чтения Cookies
app.use(fileUpload()) // Для обработки файлов
app.use('/static', express.static('static')) // Подключение статики

// Импорт контроллеров
const connectionDB = require('./controllers/connectionDB')
const regConroller = require('./controllers/regController')
const authController = require('./controllers/authController')
const botController = require('./controllers/botController')
const { updateProfilePictureHandler } = require('./controllers/profilePictureController')
const { socketHandling } = require('./controllers/socketController')

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

// Обновление аватара профиля
app.post('/updateProfilePicture', updateProfilePictureHandler)


// Получение списка пользователей
app.get('/getUsers', (req, res) => {
    const SQL_QUERY = `SELECT * FROM users_list`
    connectionDB.query(SQL_QUERY, (err, result) => {
        if (err) { res.status(500).send('Невозможно получить пользователей') }
        else { res.status(200).json(result) }
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
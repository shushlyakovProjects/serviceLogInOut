const mysql = require('mysql') // Пакет для работы с mysql (БД)

// Устанавливаем соединение с базой данных
const connection = mysql.createConnection({
    host: 'localhost',
    database: 'RAB',
    user: 'root',
    password: ''
})

module.exports = connection
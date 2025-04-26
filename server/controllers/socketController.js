const connectionDB = require('./connectionDB')

module.exports = {
    socketHandling: (socket, io) => {
        // ОБРАБОТКА ПЕРВИЧНОГО ПОДКЛЮЧЕНИЯ КЛИЕНТА
        console.log('New Client connected!');

        // Загрузка общего чата
        socket.on('loadGeneralChat', () => {
            const SQL_QUERY = `SELECT * FROM general_chat`
            connectionDB.query(SQL_QUERY, (err, responseFromDB) => {
                if (err) { notifyClients(socket, 'База данных недоступна') }
                else {
                    responseFromDB.forEach(messageFromDB => {
                        io.emit('newGeneralMessage', messageFromDB)
                    });
                }
            })
        })

        // Новое сообщение в общий чат
        socket.on('newGeneralMessageFromClient', (dataOfMessage) => {
            const { message, sender_id, sender_login } = dataOfMessage
            const SQL_QUERY = `INSERT INTO general_chat (id, sender_id, sender_login, message, date) VALUE (null, '${sender_id}','${sender_login}','${message}','${getDateNow()}')`
            connectionDB.query(SQL_QUERY, (err, result) => {
                if (err) { console.log('Ошибка базы данных. Блок нового сообщения в общий чат') }
                else {
                    io.emit('newGeneralMessage', { message, sender_id, sender_login, date: getDateNow() })
                }
            })
        })




        // Создание/Подключение к приватной комнате
        socket.on('loadPrivateChat', (dataOfChat) => {
            const { sender_id, recipient_id } = dataOfChat
            const SQL_QUERY = `SELECT * FROM private_rooms WHERE
                (user_1 = '${sender_id}' AND user_2 = '${recipient_id}') OR 
                (user_1 = '${recipient_id}' AND user_2 = '${sender_id}')`

            connectionDB.query(SQL_QUERY, (err, result) => {
                if (err) { console.log("Ошибка базы данных. Блок загрузки приватного чата!"); }
                else {
                    if (result.length == 0) {
                        const SQL_QUERY = `INSERT INTO private_rooms(room_id, user_1, user_2) VALUES (null, '${sender_id}', '${recipient_id}')`
                        connectionDB.query(SQL_QUERY, (err, result) => {
                            if (err) { console.log('Ошибка базы данных. Блок создания приватной комнаты!'); }
                            else {
                                console.log("Комната создана успешно! Подключение...");
                                const room_id = result.insertId
                                socket.join(room_id)
                                console.log(`Пользователь ${socket.id} присоединился к комнате ${room_id}`);
                                // Отправка сообщений приватного чата...
                                // getPrivateChat()
                            }
                        })
                    } else {
                        console.log('Комната существует! Подключение...');
                        const room_id = result[0].room_id
                        socket.join(room_id)
                        console.log(`Пользователь ${socket.id} присоединился к комнате ${room_id}`);
                        socket.emit('loadPrivateChat', room_id)
                        // Отправка сообщений приватного чата...
                        getPrivateChat(room_id)
                    }
                }
            })
        })


        // Отправка сообщений из личного чата на клиент
        function getPrivateChat(room_id) {
            const SQL_QUERY = `SELECT * FROM private_chats WHERE room_id='${room_id}'`
            connectionDB.query(SQL_QUERY, (err, privateMessages) => {
                if (err) { console.log('Ошибка базы данных. Блок загрузки приватного чата!'); }
                else {
                    privateMessages.forEach(message => {
                        socket.emit('newPrivateMessage', message);
                    })
                }
            })
        }

        // Получение нового приватного сообщения с клиента
        socket.on('newPrivateMessageFromClient', dataOfMessage => {
            const { room_id, message_text, sender_id, sender_fullname } = dataOfMessage

            const SQL_QUERY = `INSERT INTO private_chats(room_id, message_text, sender_id, sender_fullname, message_date)
            VALUES ('${room_id}', '${message_text}', '${sender_id}', '${sender_fullname}', '${getDateNow()}')`

            connectionDB.query(SQL_QUERY, (err, result) => {
                if (err) { console.log('Ошибка базы данных. Блок отправки приватного сообщения в базу данных!'); }
                else {
                    io.to(room_id).emit('newPrivateMessage', { message_text, sender_id, sender_fullname, message_date: getDateNow() })
                }
            })
        })

        // Получение текущей даты
        function getDateNow() {
            let now = new Date()
            let hours = (now.getHours() < 10) ? '0' + now.getHours() : now.getHours();
            let minutes = (now.getMinutes() < 10) ? '0' + now.getMinutes() : now.getMinutes();
            return hours + ':' + minutes
        }


        // io.emit()
        // socket.emit()

        // ОБРАБОТКА ОТКЛЮЧЕНИЯ КЛИЕНТА
        socket.on('disconnect', () => { console.log('Client disconnected'); })
    },
}
const connectionDB = require('./connectionDB')
const { dirname_server } = require('../config')


module.exports = {
    updateProfilePictureHandler(req, res) {
        console.log('Обновление аватара профиля...');
        if (req.files) {
            const myFile = req.files.profile_picture
            const login = req.body.login
            const nameOfFile = login + '.png'
            const path = dirname_server + '/static/image/profile/' + nameOfFile // ДОБАВИТЬ ИМЯ ФАЙЛА

            myFile.mv(path, (error) => {
                if (error) {
                    console.log('Ошибка при сохранении файла');
                    res.status(500).send(error)
                } else {
                    const SQL_QUERY = `UPDATE users_list SET avatar='${nameOfFile}' WHERE login='${login}'`

                    connectionDB.query(SQL_QUERY, (err, result) => {
                        if (err) { res.status(500).send(err) }
                        else { res.status(200).send('Аватар обновлен успешно!') }
                    })
                }
            })
        } else {
            console.log('Ошибка! Файл отсутсвует');
            res.status(400).send("Файл отсутсвует")
        }
    }
}
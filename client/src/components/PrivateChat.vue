<template>
    <main>

        <aside>
            <h2>Список пользователей</h2>
            <div class="users__box">
                <article class="users__item" v-for="(user) in USER_LIST" :key="user"
                    @click="openPrivateChat(user.id, user.name)">
                    <div class="item__avatar">
                        <img v-bind:src="server_url + user.avatar" alt="">
                    </div>
                    <div class="item__data">
                        <p>{{ user.surname }}</p>
                        <p>{{ user.name }}</p>
                    </div>
                </article>
            </div>
        </aside>

        <section class="messages__box">
            <h3 v-if="current_chat.room_id == null">Выберете чат</h3>
            <h3 v-if="current_chat.room_id != null">Собеседник {{ current_chat.recipient_name }}</h3>

            <div class="messages__history" v-if="current_chat.room_id != null">
                <article v-for="(message) in MESSAGE_LIST" :key="item"
                    :class="{'IamSender' : message.sender_id == USER_INFO.id}">

                    <div class="message__avatar">{{ message.sender_id }}</div>
                    <div class="message__body">
                        <header class="message__header">
                            <div>{{message.sender_fullname}}</div>
                            <div>{{message.message_date}}</div>
                        </header>
                        <div class="message__text">{{message.message_text}}</div>
                    </div>
                </article>
                <p v-if="MESSAGE_LIST.length == 0">Пока здесь сообщений нет</p>
            </div>

            <textarea placeholder="Ввод сообщения..." v-model="message_value" @keydown.enter.prevent="sendMessage"
                v-if="current_chat.room_id != null"></textarea>

        </section>

    </main>
</template>

<script>
import axios from 'axios';
import { io } from 'socket.io-client';

export default {
    props: ['USER_INFO'],
    data() {
        return {
            USER_LIST: [],
            MESSAGE_LIST: [],

            message_value: '',
            socket: null,
            current_chat: { room_id: null, recipient_id: '', recipient_name: '', },

            server_url: '/api/static/image/profile/'
        }
    },
    mounted() {
        // Получаем список пользователей
        this.getUsers()

        // Подключаемся к сокету для связи с комнатами
        this.socket = io('')

        // Загрузка приватного чата
        this.socket.on('loadPrivateChat', (room_id) => {
            this.current_chat.room_id = room_id
        })

        // Слушаем новые сообщения и добавляем их в массив
        this.socket.on('newPrivateMessage', message => {
            const origDate = new Date(message.message_date)

            console.log(origDate.getUTCHours());
            

            this.MESSAGE_LIST.unshift(message)
        })


        // На кнопку Escape "Выходим из диалога" (чистим все поля current_chat)
        window.addEventListener('keydown', (event) => {
            if (event.key == 'Escape') {
                this.current_chat = { room_id: null, recipient_id: '', recipient_name: '', }
                console.log('Вы вышли из чата');
            }
        })
    },
    methods: {
        async getUsers() {
            await axios.get('/api/getUsers')
                .then((result) => {
                    this.USER_LIST = result.data
                })
                .catch((error) => {
                    console.error("Ошибка! " + error)
                })
        },
        openPrivateChat(recipient_id, recipient_name) {
            this.current_chat.recipient_id = recipient_id
            this.current_chat.recipient_name = recipient_name
            this.MESSAGE_LIST = []

            const dataOfChat = {
                sender_id: this.USER_INFO.id,
                recipient_id: recipient_id
            }
            // Отправляем запрос на сокет для загрузки комнаты
            this.socket.emit('loadPrivateChat', dataOfChat)
        },
        sendMessage() {
            // Отправка нового сообщения
            const dataOfMessage = {
                room_id: this.current_chat.room_id,
                message_text: this.message_value,
                sender_id: this.USER_INFO.id,
                sender_fullname: this.USER_INFO.surname + ' ' + this.USER_INFO.name
            }
            this.message_value = ''
            this.socket.emit('newPrivateMessageFromClient', dataOfMessage)
        }
    },
}
</script>

<style scoped>
main {
    width: 100%;
    height: 75vh;
    color: whitesmoke;

    display: flex;
    justify-content: space-between;
    gap: 10px;
}

img {
    width: 50px;
    aspect-ratio: 1/1;
    object-fit: cover;
    border-radius: 50%;
}

/* Настройка бокового меню (список пользователей) */
aside {
    width: 25%;
}

aside .users__box {
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow: auto;
    margin-top: 15px;
}

aside .users__item {
    background-color: rgb(45, 45, 45);
    border-radius: 10px;
    padding: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    transition-duration: 0.2s;
    cursor: pointer;
}

aside .users__item:hover {
    box-shadow: 0 0 10px orange inset;
}

.current_chat {
    box-shadow: 0 0 5px orange inset;
}

/* Настройка ИСТОРИИ СООБЩЕНИЙ */
section.messages__box {
    width: 75%;
    display: flex;
    flex-direction: column;
    border: 2px solid rgb(45, 45, 45);
    border-radius: 10px;
    padding: 20px;
}

section .messages__history {
    width: 100%;
    height: 100%;
    margin: 10px 0;

    display: flex;
    flex-direction: column-reverse;
    gap: 5px;

    overflow: auto;
}

section article {
    width: 60%;
    height: auto;
    display: flex;
    gap: 5px;
}

section .IamSender {
    flex-direction: row-reverse;
    align-self: flex-end;
}

section .IamSender .message__body {
    border-radius: 20px 5px 20px 20px !important;
}

section .message__avatar {
    height: 50px;
    aspect-ratio: 1/1;
    border-radius: 50%;
    margin-right: 10px;

    background-color: rgb(45, 45, 45);

    display: flex;
    justify-content: center;
    align-items: center;
}

section .message__body {
    width: 100%;
    background-color: rgb(45, 45, 45);
    border-radius: 5px 20px 20px 20px;
    padding: 10px;
    /* overflow-wrap: break-word; */
}

section .message__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 5px;
    color: orange;
}

/* Настройка ПОЛЯ ВВОДА */
textarea {
    width: 100%;
    padding: 20px;
    font-size: 16px;
    border: 0;
    border-radius: 20px;

    background-color: rgb(45, 45, 45);
    color: whitesmoke;

    resize: none;
}

textarea:focus {
    outline: 0;
}
</style>
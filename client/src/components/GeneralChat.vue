<template>
    <main>

        <h2>Общий чат</h2>

        <section class="history__messages">
            <transition-group name="messages__list">
                <article v-for="(item) in messages" :key="item">
                    <div class="message__photo">
                        <img :src="server_url + item.sender_login+'.png'" alt="">
                    </div>
                    <div class="message__body">
                        <header class="message__header">
                            <div class="message__login">{{ item.sender_login }}</div>
                            <div class="message__date">{{ item.date }}</div>
                        </header>
                        <div class="message__text">{{ item.message }}</div>
                    </div>
                </article>
            </transition-group>

            <p v-if="!messages.length">Пока здесь сообщений нет</p>
        </section>

        <textarea placeholder="Напишите сообщение..." v-model="message_value"
            @keydown.enter.prevent="sendMessage"></textarea>

    </main>
</template>

<script>
import axios from 'axios';
import { io } from 'socket.io-client'

export default {
    data() {
        return {
            USER_INFO: {},
            message_value: '',
            messages: [],
            socket: null,
            server_url: '/api/static/image/profile/'
        }
    },
    mounted() {
        this.checkAuth()

        // Подключение к Веб-сокет серверу по стандартному пути
        this.socket = io('')

        // Подгрузка общего чата при входе
        this.socket.emit('loadGeneralChat')

        // Обработка сообщений от сервера...
        this.socket.on('newGeneralMessage', (data) => {
            if (data.hasOwnProperty('sender_id')) {
                this.messages.unshift(data)

                if (data.sender_id != this.USER_INFO.id) {
                    const notification = new Audio()
                    notification.src = '../../public/notification.mp3'
                    notification.play()
                }
            } else {
                console.error(data)
            }
        })
    },
    methods: {
        async sendMessage() {
            document.querySelector('.history__messages').scrollTo(0, 0)
            if (this.message_value) {
                const dataOfMessage = {
                    message: this.message_value,
                    sender_id: this.USER_INFO.id,
                    sender_login: this.USER_INFO.login
                }
                this.message_value = ''
                this.socket.emit('newGeneralMessageFromClient', dataOfMessage)
            }
        },
        async checkAuth() {
            await axios.post('/api/authorization')
                .then((result) => { this.USER_INFO = result.data[0] })
                .catch((err) => {
                    console.error('Ошибка авторизации...');
                    this.$router.push('/auth')
                })
        },
    },
    beforeDestroy() {
        // Отключаемся от сокета при уходе с компонента
        if (this.socket) { this.socket.disconnect() }
    },
}
</script>

<style scoped>
main {
    width: 100%;
    height: 100%;
    color: whitesmoke;
}

.history__messages {
    height: 60vh;
    margin: 10px 0;
    padding: 10px;

    display: flex;
    flex-direction: column-reverse;
    gap: 5px;

    overflow: auto;
}

.history__messages article {
    height: auto;
    display: flex;
    width: 60%;
}

.message__photo {
    height: 70px;
    aspect-ratio: 1/1;
    border-radius: 50%;
    margin-right: 10px;

    background-color: rgb(45, 45, 45);

    display: flex;
    justify-content: center;
    align-items: center;
}
.message__photo img{
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
}

.message__body {
    width: 100%;
    background-color: rgb(45, 45, 45);
    border-radius: 5px 20px 20px 20px;
}

.message__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: bold;
}

.message__text {
    padding: 10px 20px;
}


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

/* ....Анимация сообщий.... */
.messages__list-move,
.messages__list-enter-active,
.messages__list-leave-active {
    transition: all 1s ease;
}

.messages__list-enter-from,
.messages__list-leave-to {
    opacity: 0;
    transform: translateX(40px);
}
</style>
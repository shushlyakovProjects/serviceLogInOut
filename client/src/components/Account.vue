<template>
    <main>
        <div class="wrapper">

            <div class="info">
                <div class="info__text">
                    <h2>Личный кабинет</h2>
                    <h3>Пользователь: {{ USER_INFO.surname }} {{ USER_INFO.name }}</h3>
                    <p>ID: {{ USER_INFO.id }}</p>
                    <p>Роль: {{ USER_INFO.role }}</p>
                </div>
                <button @click="logout">Выйти из кабинета</button>
            </div>

            <div class="avatar">
                <img :src="server_url + USER_INFO.avatar">
                <form @submit.prevent="updateProfilePicture()" class="box__profile_picture" ref="form__profile_picture">
                    <input type="file" name="profile_picture">
                    <input type="submit" value="Обновить аватар" />
                </form>
            </div>

        </div>




        <div class="recoveryPass">
            <div class="recoveryPass__left">
                <button @click="copyIdentificationToken">Скопировать токен идентификации</button>
                <a class="likeButton" href="https://web.telegram.org/k/#@PasswordRecoverySystemm_bot"
                    target="_blank">Открыть Бота</a>
                <p>Восстановление пароля производится при помощи Telegram BOT</p>
                <h3>Инструкция:</h3>
                <ol>
                    <li>Скопируйте токен идентификации</li>
                    <li>Укажите его в Боте</li>
                    <li>Бот идентифицирует вас и сгенерирует токен восстановления</li>
                    <li>Укажите токен восстановления в поле справа</li>
                </ol>
            </div>
            <div class="recoveryPass__right">
                <input type="text" placeholder="Токен восстановления от Бота" v-model="recoveryToken">
                <button @click="updateRecoveryToken">Обновить токен восстановления</button>
                <p>Ваш текущий токен:</p>
                <p>{{ String(USER_INFO.recovery_token).slice(0, 20) }}...</p>
            </div>
        </div>
    </main>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            USER_INFO: {},
            recoveryToken: '',
            server_url: '/api/static/image/profile/'
        }
    },
    mounted() {
        this.checkAuth()
    },
    methods: {
        async updateProfilePicture() {
            const form = this.$refs.form__profile_picture
            const formData = new FormData(form)
            formData.append('login', this.USER_INFO.login)
            await axios.post('/api/updateProfilePicture', formData)
                .then((result) => { console.log(result); })
                .catch((error) => { console.log(error); })
        },
        async checkAuth() {
            await axios.post('/api/authorization')
                .then((result) => { this.USER_INFO = result.data[0] })
                .catch((err) => {
                    console.error('Ошибка авторизации...');
                    this.$router.push('/auth')
                })
        },
        logout() {
            document.cookie = 'ACCESS_TOKEN='
            this.$emit('updateUser')
            this.$router.push('/auth')
        },
        copyIdentificationToken() {
            navigator.clipboard.writeText(this.USER_INFO.identification_token)
            alert('Токен идентификации скопирован!')
        },
        async updateRecoveryToken() {
            if (this.recoveryToken) {
                if (confirm('Вы уверены, что хотите обновить токен восстановления?')) {
                    const recovery_data = {
                        userId: this.USER_INFO.id,
                        recoveryToken: this.recoveryToken
                    }
                    this.recoveryToken = ''
                    await axios.post('/api/updateRecoveryToken', recovery_data)
                        .then(() => { this.checkAuth() })
                        .catch((err) => { console.error(err) })
                }
            } else {
                alert('Поле токена не заполнено!')
            }
        }
    },
}
</script>

<style scoped>
main {
    color: whitesmoke;
}

header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center
}

button,
.likeButton {
    color: whitesmoke;
    background-color: transparent;
    border: 1px solid whitesmoke;
    font-size: 16px;
    padding: 8px 16px;
    border-radius: 5px;
    transition-duration: 0.5s;
    text-decoration: none;
    text-align: center;
}

button:hover,
.likeButton:hover {
    background-color: rgb(20, 20, 20);
    cursor: pointer;
}

.recoveryPass {
    border: 1px solid whitesmoke;
    padding: 20px;
    margin: 20px 0;
    border-radius: 5px;
    display: flex;
    gap: 20px;
    justify-content: space-between;
}

.recoveryPass>div {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.recoveryPass ol {
    margin-left: 20px;
}

.avatar {
    justify-items: center;
}

.avatar img {
    width: 200px;
    height: 200px;
    object-fit: cover;
    border-radius: 10px;
}

.box__profile_picture {
    background-color: transparent;
    width: 100%;
}

.box__profile_picture input {
    background-color: transparent;
    color: whitesmoke;
}


.wrapper {
    display: grid;
    grid-template-columns: 3fr 1fr;
}

.info {
    display: flex;
    flex-direction: column;
    padding: 20px;
    align-items: start;
}
.info__text{
    flex-grow: 1;
}
</style>
<template>
    <main>
        <form @submit.prevent="authorization">
            <h1>Авторизация</h1>

            <h4>Логин</h4>
            <input type="text" placeholder="Укажите логин" v-model="userInfo.login" required>

            <h4>Пароль</h4>
            <input type="password" placeholder="Укажите пароль" v-model="userInfo.password" required>

            <p class="error__message">{{ messages.error }}</p>
            <p class="success__message">{{ messages.success }}</p>
            <p class="warn__message" @click="recoveryPass">Я забыл пароль</p>

            <input type="submit" value="Авторизация" />

        </form>
    </main>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            userInfo: {
                login: '',
                password: '',
            },
            messages: {
                error: '',
                success: ''
            }
        }
    },
    mounted() {
        if (document.cookie.split('=')[1] != '') { this.authorization() }
    },
    methods: {
        async authorization() {
            if (this.userInfo.login) {
                document.cookie = `ACCESS_TOKEN=`
                await axios.post('/api/authorization', this.userInfo)
                    .then((result) => {
                        this.messages.error = ''
                        this.messages.success = 'Успешно'
                        this.$emit('updateUser')
                        this.$router.push('/account')
                    })
                    .catch((err) => {
                        this.messages.success = ''
                        this.messages.error = 'Ошибка! ' + err.response.data
                    })
            }
        },
        async recoveryPass() {
            if (this.userInfo.login) {
                await axios.post('/api/recoveryPass', { login: this.userInfo.login })
                    .then((result) => {
                        this.messages.error = ''
                        this.messages.success = 'Успешно! ' + result.data
                    })
                    .catch((err) => {
                        this.messages.error = 'Ошибка! ' + err.response.data
                        this.messages.success = ''
                    })
            } else {
                this.messages.error = 'Укажите логин для восстановления'
            }
        }
    }
}
</script>

<style scoped>
main {
    display: flex;
    justify-content: center;
    align-items: center;
}

.warn__message {
    color: rgb(218, 142, 1);
    cursor: pointer;
    user-select: none;
}
</style>
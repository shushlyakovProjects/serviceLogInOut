<template>
    <main>
        <form @submit.prevent="registration">
            <h1>Регистрация</h1>

            <h4>Фамилия</h4>
            <input type="text" placeholder="Укажите фамилию" v-model="userInfo.surname" required>

            <h4>Имя</h4>
            <input type="text" placeholder="Укажите имя" v-model="userInfo.name" required>

            <h4>Логин</h4>
            <input type="text" placeholder="Укажите логин" v-model="userInfo.login" required>

            <h4>Пароль</h4>
            <input type="password" placeholder="Укажите пароль" v-model="userInfo.password" required>

            <h4>Подтвердите пароль</h4>
            <input type="password" placeholder="Повторите пароль" v-model="checkpassword" required>

            <p class="error__message">{{ messages.error }}</p>
            <p class="success__message">{{ messages.success }}</p>

            <input type="submit" value="Регистрация">
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
        surname: '',
        name: ''
      },
      checkpassword: '',
      messages: {
        error: '',
        success: ''
      }
    }
  },
  methods: {
    async registration() {
      if (this.userInfo.password == this.checkpassword) {

        await axios.post('/api/registration', this.userInfo)
          .then((result) => {
            this.messages.error = ''
            this.messages.success = result.data
          })
          .catch((err) => {
            this.messages.error = err.response.data
            this.messages.success = ''
          })

      } else {
        this.messages.success = ''
        this.messages.error = 'Ошибка! Пароли не совпадают'
      }
    }
  },
}
</script>

<style scoped>
main{
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
import { createApp } from 'vue'
import App from './App.vue'

// Импортируем методы для настройки роутера
import { createRouter, createWebHistory } from 'vue-router'

// Импортируем компоненты
import Registration from './components/Registration.vue'
import Authorization from './components/Authorization.vue'
import Account from './components/Account.vue'
import Chat from './components/Chat.vue'

// Создаем массив, указывающий соответствие пути и компонента
const routes = [
    { path: '/reg', component: Registration },
    { path: '/auth', component: Authorization },
    { path: '/account', component: Account },
    { path: '/general-chat', component: Chat },
]

// Создаем роутер с настройками
const router = createRouter({
    history: createWebHistory(),
    routes
})

createApp(App)
    .use(router) // Присоединяем роутер к приложению
    .mount('#app')

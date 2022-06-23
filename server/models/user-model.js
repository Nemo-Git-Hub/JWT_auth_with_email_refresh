// -= server/models/user-model.js =-

// Схема описывает какие поля будет содержать сущность(user, token, или какую еще нужно будет описать).
// Как параметр передаем {объект} и в нем описываем какие поля будут у пользователя

const {Schema, model} = require('mongoose'); // импортируем сюда схему и модель из пакета 'mongoose'

const UserSchema = new Schema({ // создаем схему user
    email: {type: String, unique: true, required: true}, // поле почты
    password: {type: String, required: true}, // поле пароля
    isActivated: {type: Boolean, default: false}, // поле говорит: подтвердил user email или нет (когда подтвердит -
    // будем делать default: true)
    activationLink: {type: String}, // поле для хранения ссылки для активации
})

module.exports = model('User', UserSchema); // экспортируем модель, которую сделали на основании схемы (название схемы,
// сама схема (l.8))

// type - тип поля
// unique - уникальное поле (т.е. 2-х записей в БД с одинаковым полем email быть не должно)
// required - оно должно быть
// true - обязательным

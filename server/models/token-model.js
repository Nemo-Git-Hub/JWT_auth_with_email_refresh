// -= server/models/token-model.js =-

// схема хранения refresh token, id user, также сюда можно добавить IP-адрес, с которого зашел user, fingerprint browser

const {Schema, model} = require('mongoose');

const TokenSchema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'}, // данные пользователя. Тип: ObjectId, кот. достаем из Schema
	// поля Types. ref: 'User' - указание на что ссылается поле: на модель пользователя
	refreshToken: {type: String, required: true}, // поле refreshToken, его будем генерировать и сохранять в БД
}) // required: true - значит поле обязательное

module.exports = model('Token', TokenSchema);

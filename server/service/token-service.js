// -= server/service/token-service.js =-

const jwt = require('jsonwebtoken'); // импортируем модуль
const tokenModel = require('../models/token-model'); // импортируем модель схемы данных токена

class TokenService {
	generateTokens(payload) { // функция генерации пары токенов access и refresh. Параметрами она принимает payload,
		// который мы будем прятать в токен (те данные, которые в токен вшиваются)
		const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '15s'}) // у jwt
		// вызываем функцию sign (1й параметр - payload, 2й параметр - секретный ключ из .env, 3й параметр - опция
		// expiresIn: время жизни токена. Чем меньше, тем лучше для access, refresh - сколько дней можно не входить и
		// потом не будет нужна авторизация.
		const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30s'})
		return {
			accessToken,
			refreshToken
		} // возвращаем 2 токена внутри объекта
	}
	
	// Создаем 2 одинаковые фун для верификации Access and Refresh Token. После того как мы токен верифицируем,
	// провалидируем нам вернется тот самый payload, кот мы в него вшивали
	validateAccessToken(token) {
		try {
			const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
			return userData;
		} catch (e) { // если при верификации произошла ошибка, то попадаем в блок catch
			return null; // и возвращаем null
		}
	}
	
	validateRefreshToken(token) {
		try {
			const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
			return userData;
		} catch (e) {
			return null;
		}
	}
	
	// функция сохранения refreshToken в БД для конкретного пользователя.
	// При таком способе решения задачи в БД у 1 юзера всегда должен быть ОДИН токен и при попытке зайти с другого
	// устройства юзера выкинет из предыдущего устройства, т.к. токен перезатрется и в БД запишется новый токен (30:00)
	async saveToken(userId, refreshToken) { // параметрами передаем (id user, сам refreshToken)
		const tokenData = await tokenModel.findOne({user: userId}) // сначала ищем по такому userId токен в БД
		if (tokenData) { // проверяем: если в БД нашли, то:
			tokenData.refreshToken = refreshToken; // у этого поля перезаписываем refreshToken
			return tokenData.save(); // вызываем функцию save, чтобы обновить в БД refreshToken
		} // если не нашли, значит это впервые и тогда
		const token = await tokenModel.create({user: userId, refreshToken}) // создаем токен, обращаемся к модели и
		// вызываем функцию create
		return token; // возвращаем токен
	}
	
	async removeToken(refreshToken) { // создаем фун удаления токена
		const tokenData = await tokenModel.deleteOne({refreshToken}) // обращаемся к tokenModel и вызываем фун
		// deleteOne, куда параметром передаем refreshToken, т.е. будет найдена запись с этим токеном и удалена
		return tokenData; // сама запись из БД вернется, поэтому помещаем ее в переменную tokenData
	}
	
	async findToken(refreshToken) { // создаем фун поиска токена в БД
		const tokenData = await tokenModel.findOne({refreshToken}) // у самой модели вызываем фун findOne
		return tokenData;
	}
}

module.exports = new TokenService();

// -= server/controllers/user-controller.js =-

const userService = require('../service/user-service'); //импортируем сервис в файл, чтобы передать в него email и pass
const {validationResult} = require('express-validator'); // чтобы получить результаты валидации подключаем фун validationResult
const ApiError = require('../exceptions/api-error'); // импортируем сюда наш класс

class UserController { // создаем class
	async registration(req, res, next) { // метод регистрации (запрос, ответ,
		try {
			const errors = validationResult(req); // воспользуемся фун. validationResult. Для этого создадим переменную,
			// вызовем фун и передадим туда req. Из него автоматически достанется тело и провалидируются нужные поля
			if (!errors.isEmpty()) { // затем проверяем, находится ли что-то в errors. Если наш массив не пустой, значит
				// произошла ошибка при валидации и нам необходимо ее передать в error heandlers в наш мидлваер
				return next(ApiError.BadRequest('Ошибка при валидации', errors.array())) // в error-middleware передаем:
				// BadRequest, указываем какое-нибудь сообщение, а 2-м параметром фун BadRequest принимает массив ошибок.
				// Получаем его и передаем 2-м параметром (Проверка в Postman 54:54)
			}
			const {email, password} = req.body; //  http-составляющая: вытаскиваем из тела запроса email и pass.
			// Их нужно передать в функцию регистрации внутри сервиса
			const userData = await userService.registration(email, password); // передаем в сервис email, password
			res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
			// чтобы эта строка(15) работала нужно подключить middleware in index.js (l.15).
			// refreshToken храним в куках: ('refreshToken' - ключ по которому этот параметр будет сохранен, сама кука,
			// опции(макс возраст:дни*часы*мин*сек*милисек, httpOnly: true - необходимо чтобы эту куку
			// нельзя было менять внутри браузера из JS; for https можно добавить флаг secure:true)
			return res.json(userData); // возвращаем токены и информацию о пользователе - отправляем их в браузер в json
		} catch (e) {
			next(e);
		}
	}
	
	async login(req, res, next) {
		try {
			const {email, password} = req.body; // из тела запроса вытаскиваем мыло и пароль
			const userData = await userService.login(email, password); // вызываем фун login из userService
			res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true}) // в cookie
			// устанавливаем refreshToken
			return res.json(userData); // возвращаем на клиент токены и информацию о пользователе и теперь
			// переходим в user-service.js, чтобы описать там эту логику
		} catch (e) {
			next(e);
		}
	}
	
	async logout(req, res, next) {
		try {
			const {refreshToken} = req.cookies; // обращаемся к реквесту к полю кукиес и из куки вытаскиваем refreshToken
			const token = await userService.logout(refreshToken); // у сервиса вызываем одноименную фун и в нее передаем этот
			// refreshToken. Фун называем logout и сейчас мы ее также реализуем
			res.clearCookie('refreshToken'); // С помощью фун clearCookie('название токена') удаляем саму куку из refreshToken
			return res.json(token); // в return можно было вернуть 200-й код, но мы для наглядности вернем сам токен
		} catch (e) {
			next(e);
		} // переходим в user-service.js и создаем там одноименную фун
	}
	
	async activate(req, res, next) {
		try {
			const activationLink = req.params.link; // из строки запроса получаем ссылку активации (у объекта req поле
			// params, ссылка наз. link. Её указывали в роутере как динамическую (:link) (см.router/index.js)
			await userService.activate(activationLink); // обращаемся к userService и вызываем activate,
			// в который передаем ссылку activationLink (50)
			return res.redirect(process.env.CLIENT_URL); // поскольку back и front на разных хостах, после перехода
			// пользователя по ссылке нам нужно редиректнуть (перенаправить) его на front. Для этого у res вызываем
			// redirect и передаем в него адрес
		} catch (e) {
			next(e);
		}
	}
	
	async refresh(req, res, next) { // создаем фун обновления токена
		try {
			const {refreshToken} = req.cookies; // достаем из куки refreshToken
			// поскольку мы куки перезаписываем, нам нужно будет снова токен сгенерировать, установить в куки и отправить
			// ответ на клиент (то же что мы делали при логине)
			const userData = await userService.refresh(refreshToken); // только у userService вызываем фун refresh(которую
			// сейчас создадим) и в нее передаем refreshToken
			res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
			return res.json(userData);
		} catch (e) {
			next(e);
		}
	}
	
	async getUsers(req, res, next) {
		try {
			const users = await userService.getAllUsers(); // получаем список юзеров, вызвав фун в сервисе
			return res.json(users); // возвращаем ответ на клиент
		} catch (e) {
			next(e);
		}
	}
}


module.exports = new UserController(); // по итогу из файла экспортируем {объект}, т.е. экземпляр этого класса, внутри
// которого есть несколько асинхронных методов.
// Для каждого маршрута (router/index.js) создаем по функции (методы этого класса)

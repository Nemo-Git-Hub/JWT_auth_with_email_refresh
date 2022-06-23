// -= server/router/index.js =-

const Router = require('express').Router; // импортируем router из express
const userController = require('../controllers/user-controller'); // импортируем контроллер из нашего файла и
// сопоставляем маршруты с функциями контроллера
const router = new Router(); // создаем экземпляр роутера
const {body} = require('express-validator'); // Настраиваем валидацию. Подключаем body - фун для валидации тела запроса
const authMiddleware = require('../middlewares/auth-middleware');

// обозначаем какие endpoints у нас будут для:
router.post('/registration', // - регистрации
    body('email').isEmail(), // передаем фун body как мидлваер в роутинг, вызываем и передаем в нее название поля,
	// кот хотим провалидировать. Там есть куча валидаторов, но нас интересует конкретно проверка на емайл
    body('password').isLength({min: 3, max: 32}), // и сразу провалидируем пароль. Опять вызываем body,
	// параметром передаем туда название поля, и валидировать будем по длине (перейдемк контроллеру, чтобы получить
	// результат этой валидации)
    userController.registration
);
router.post('/login', userController.login); // - логина
router.post('/logout', userController.logout); // - выхода из аккаунта. Внутри этого endpoint будет удаляться из
// БД RefreshToken
router.get('/activate/:link', userController.activate); // - активации аккаунта по link, приходящей на почту
router.get('/refresh', userController.refresh); // будет перезаписывать accessToken
router.get('/users', authMiddleware, userController.getUsers); // тестовый endpoint, для получения списка users.
// Будет доступен только для авторизованных users

module.exports = router // экспортируем router

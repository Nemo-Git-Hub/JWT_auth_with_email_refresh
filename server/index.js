require('dotenv').config() // для возможности чтения конфигурации из файла .env
const express = require('express') // подключили express, д/использования его функций
const cors = require('cors') //
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const router = require('./router/index') // импортируем роутер из нашего файла
const errorMiddleware = require('./middlewares/error-middleware') // подключили middleware


const PORT = process.env.PORT || 5000 // переменная д/порта (31), данные берем из .env, а если там не указано, то 5000
const app = express() // с помощью express создаем условный экз. нашего приложения.

// Подключаем middleware:
app.use(express.json())
app.use(cookieParser())
app.use(cors({
	credentials: true,
	origin: process.env.CLIENT_URL
}));
app.use('/api', router) // '/api' - маршрут, по которому router будет отрабатывать, router - сам router
app.use(errorMiddleware) // !!! в цепочке мидлваров ОБЯЗАТЕЛЬНО должен идти ПОСЛЕДНИМ!!!

const start = async () => { // создали асинхронную функцию. Внутри используем try-catch, для отлавливания Errors
	try {
		await mongoose.connect(process.env.DB_URL, { // connect to DB.
			// Все функции к БД создаем async и запуск начинаем с await
			useNewUrlParser: true, // новый анализатор строк URL MongoDB Node.js
			useUnifiedTopology: true // новый механизм обнаружения и мониторинга серверов MongoDB Node.js
		}, () => console.log('Connect to MongoDB')) // ()-callback, вызывается в случае успешного выполнения команды
// запускаем приложение: у арр вызываем фун listen(какой порт слушать, callback)
		app.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`))
	} catch (e) {
		console.log(e)
	}
}
start() // вызываем функцию (23)

// запускаем приложение командой npm run dev
// In package.json write:
// "scripts": {
//     "dev": "nodemon index.js"
//   }
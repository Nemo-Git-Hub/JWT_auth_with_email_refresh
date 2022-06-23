// -= server/service/user-service.js =-

const UserModel = require('../models/user-model'); // используем модель пользователя, которую создали раньше
const bcrypt = require('bcrypt'); // для кодирования паролей
const uuid = require('uuid'); // для генерации ссылки
const mailService = require('./mail-service'); // импортируем сервисы
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto'); // импортируем юзер ДТО
const ApiError = require('../exceptions/api-error'); // импортируем ApiError

class UserService { // создали класс
    async registration(email, password) { // функция для регистрации пользователя
        const candidate = await UserModel.findOne({email}) // убедиться, что в БД нет записи с таким email.
        // Для этого, у UserModel вызываем функцию findOne и параметром передаем {email} - объект с полем
        if (candidate) { // проверяем: если candidate есть, то
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`) // кидаем
            // ошибку, которая будет обрабатываться в контроллере
        }
        const hashPassword = await bcrypt.hash(password, 3); // хешируем пароль, для этого вызываем bcrypt.hash
        const activationLink = uuid.v4(); // uuid.v4() вернет random unique string похожую на:v34fa-asfasf-142saf-sa-asf

        const user = await UserModel.create({email, password: hashPassword, activationLink}) // создаем пользователя и
        // сохраняем его в БД
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);
        //вызываем фун отправки активационного письма у mailService. Параметры: email юзера куда отправляем письмо,
        // активационная ссылка

        // на основании model создадим DTO, чтобы выкинуть лишние поля.
        const userDto = new UserDto(user); // id, email, isActivated. Создаем экземпляр класса и параметром в
        // конструктор передаем модель. Это просто объект user. Пот итогу эта ДТО будет обладать 3-мя полями: id, email,
        // isActivated и ее можно использовать как payload.
        const tokens = tokenService.generateTokens({...userDto}); // функция генерации токена. На входе ожидает
        // объект, а не instance (экземпляр) userDTO, поэтому разворачиваем эту DTO в новый {} с помощью оператора spred
        await tokenService.saveToken(userDto.id, tokens.refreshToken); // сохраняем refreshToken в БД

        return {...tokens, user: userDto} // возвращаем {}, в него добавляем 2 токена ( разворачиваем {...token} и как
        // поле user добавим userDDTO
    }

    // создаем функцию активации пользователя
    async activate(activationLink) { // параметр - ссылка на активацию (l.20)
        const user = await UserModel.findOne({activationLink}) // в БД ищем user по этой ссылке: обращаемся к
        // модели, вызываем findOne и передаем в нее эту ссылку
        if (!user) { // проверяем: если в БД нет пользователя с такой ссылкой, то
            throw ApiError.BadRequest('Некорректная ссылка активации')
        } //, а если юзер найден, то
        user.isActivated = true; // у юзера поле isActivated меняем на true
        await user.save(); // и сохраняем обновленного пользователя в БД с помощью функции save().
    } // теперь юзер активирован и его мыло подтвержден и переходим в server/controllers/user-controller.js (l.50)

    async login(email, password) { // создаем функцию для логина
        const user = await UserModel.findOne({email}) // ищем в БД пользователя с данным емейлом
        if (!user) { // если его нет и фун findOne вернула нам null, то
            throw ApiError.BadRequest('Пользователь с таким email не найден') // пробрасываем ошибку
        } // если условие не выполнилось, то пользователь был найден и нам необходимо сравнить пароли в хешированном виде
        const isPassEquals = await bcrypt.compare(password, user.password); // с помощью фун compare сравниваем пароль,
        // который передал нам пользователь в запросе с паролем, кот хранится в БД
        if (!isPassEquals) { // если пароли не равны, то фун вернет нам false и мы возвращаем ошибку
            throw ApiError.BadRequest('Неверный пароль');
        }
        const userDto = new UserDto(user); // генерируем DTO и из модели выбрасываем все не нужное
        const tokens = tokenService.generateTokens({...userDto}); // Генерируем пару токенов. Для этого есть
        // генерирующая фун generateTokens в tokenService. Передаем туда userDto
    
        await tokenService.saveToken(userDto.id, tokens.refreshToken); // сохраняем refreshToken в БД
    
        return {...tokens, user: userDto} // возвращаем {}, в него добавляем 2 токена ( разворачиваем {...token} и как
        // поле user добавим userDDTO
    }

    async logout(refreshToken) { // асинхрон фун, кот параметром принимает refreshToken
        const token = await tokenService.removeToken(refreshToken); // удаляем refreshToken из БД. Это мы будем делать
        // внутри токен-сервиса. Создаем фун removeToken и параметром в нее этот токен передаем
        return token; // и то, что эта фун нам будет возвращать возвращаем из фун logout
    } // теперь идем в токен-сервис и создаем там фун removeToken

    async refresh(refreshToken) { // создаем фун refresh для контроллера
        if (!refreshToken) { // сразу проверяем: если пришел null or undefined
            throw ApiError.UnauthorizedError(); // пробрасываем ошибку UnauthorizedError, поскольку если у юзера токена
            // нет, значит он и не авторизован
        }
        const userData = tokenService.validateRefreshToken(refreshToken); // нужно провалидировать токен и проверить что
        // он не подделан и срок его годности не иссяк. Для этого используем из tokenService фун validateRefreshToken,
        // кот сейчас создадим там и вернемся сюда
        const tokenFromDb = await tokenService.findToken(refreshToken);// нужно убедиться, что этот токен действительно
        // находится в БД. Для этого используем из tokenService фун findToken, кот сейчас создадим там и вернемся сюда
        if (!userData || !tokenFromDb) { // делаем проверку и убеждаемся, что валидация и поиск токена в БД прошли успешно
            throw ApiError.UnauthorizedError(); // если не нашли токен в БД и в этих переменных находится null return error
        } // если условие не выполнилось, то мы также как и при логине:
        const user = await UserModel.findById(userData.id); // вытаскиваем пользователя из БД
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto}); // генерируем новую пару токенов

        await tokenService.saveToken(userDto.id, tokens.refreshToken); // refreshToken записываем в БД
        return {...tokens, user: userDto} // и возвращаем ответ
    }

    async getAllUsers() { // создаем фун для получения всех пользователей
        const users = await UserModel.find(); // обращаемся к модели и вызываем фун find не указывая параметры
        return users; // и она вернет нам все записи пользователей (теперь go to controller)
    }
}

module.exports = new UserService(); // Сервис - это класс и на выходе экспортируем экземпляр этого класса с набором методов

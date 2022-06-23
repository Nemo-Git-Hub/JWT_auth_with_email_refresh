// -= server/middlewares/auth-middleware.js =-

const ApiError = require('../exceptions/api-error'); // импортируем класс ApiError
const tokenService = require('../service/token-service');

module.exports = function (req, res, next) { // создаем middleware - это фун, кот принимает параметрами (req, res, и
    // фун next() - она вызывает след в цепочке middleware и ее вызывать обязательно)
    try {
// Мы отправляем запрос на получение пользователе и знаем, что этот запрос доступен только авторизованным пользователям,
// поэтому нам необходимо к запросу как-то прицепить токен. Делается это с помощью заголовка http-запроса header и
// обычно токен указывают в заголовке Authorization. Сначала указывается тип токена, обычно это Bearer и затем сам токен
// доступа, т.е. ${ACCESS_TOKEN}
// GET/api/users
// Headers: ...
// Authorization: "Bearer ${ACCESS_TOKEN}"
// Сейчас внутри этого middleware у нас задача этот токен вытащить из заголовка
        const authorizationHeader = req.headers.authorization; // создаем константу, обращаемся к req поле headers и
        // authorization (как этот header указать и проверить в Postman см. видео 01:08:10)
        if (!authorizationHeader) { // проверяем: если этот хедер не указан, то мы снова возвращаем некст и ошибку
            return next(ApiError.UnauthorizedError());
        } // если условие не отработало, то движемся дальше

        // сейчас Header состоит из двух слов: Bearer и сам токен
        const accessToken = authorizationHeader.split(' ')[1]; // с помощью фун сплит по пробелу мы эту строку
        // разбиваем на 2 слова Bearer будет [0] элементом массива, а сам токен [1], поэтому достаем его по индексу [1]
        if (!accessToken) { // снова проверяем, если этого токена нет, то
            return next(ApiError.UnauthorizedError()); // возвращаем ошибку
        } // если этот блок не отработал, значит у нас есть токен и нам нужно его провалидировать

        const userData = tokenService.validateAccessToken(accessToken); // для валидации используем фун из tokenService,
        // кот заранее сюда импортируем. Т.к. здесь вызываем Access_Token, вызываем фун именно для него
        if (!userData) { // если при валидации произошла ошибка, то фун вернет нам null, поэтому проверяем, что эта фун
            // нам что-то вернула. Если не вернула - возвращаем next c ошибкой
            return next(ApiError.UnauthorizedError());
        }

        req.user = userData; // если все ок и токен валидный, то в поле юзер мы помещаем данные о пользователе,
        // кот вытащили из токена, после чего вызываем фун next()
        next(); // и передаем управление следующему middleware
    } catch (e) {
        return next(ApiError.UnauthorizedError()); // если попали в этот блок, то возвращаем фун next(ApiError.UnauthorizedError())
    }
};

// в роутинге не забываем импортировать этот middleware и передать его вторым параметром в нужный end-point. В нашем
// случае - для получения пользователей (проверка в Postman см. видео 01:10:09)
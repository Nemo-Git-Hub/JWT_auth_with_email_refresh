// -= server/exceptions/api-error.js =-

// универсальный класс для ошибок, как-то связанных с API. Этот класс будет расширять дефолтный JavaScript -овый Error

module.exports = class ApiError extends Error { // сразу отсюда его экспортируем
    status; // добавляем 2 поля
    errors;

    constructor(status, message, errors = []) { // т.к. ошибок здесь нет, то массив по умолчанию создаем пустым
        super(message); // вызываем родительский конструктор с помощью super и передаем туда сообщение
        this.status = status; // в instance (экземпляр) этого класса помещаем статус
        this.errors = errors; // в instance (экземпляр) этого класса помещаем ошибки
    }

    // статик функции - это функции, которые можно использовать не создавая экземпляр класса
    static UnauthorizedError() { // создали фун., которая ничего не принимает и...
        return new ApiError(401, 'Пользователь не авторизован') // ...и возвращает экземпляр текущего класса,
    } // т.е. создаем ApiError, как статус указываем 401, означающий, что Пользователь не авторизован,
      // и вторым параметром передаем это же сообщение

    // создаем вторую статик функцию, для того когда user указал не корректные параметры, не прошел валидацию, и т.п.
    static BadRequest(message, errors = []) { // параметрами принимаем сообщения и ошибки.
        return new ApiError(400, message, errors); // возвращаем instance (экземпляр) текущего класса, статус 400,
    } // передаем сообщение и ошибки
}

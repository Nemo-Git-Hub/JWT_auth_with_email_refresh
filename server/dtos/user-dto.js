//-= server/dtos/user-dto.js =-

// DTO - Data Transfer Object - класс, обладающий некоторыми полями, которые мы будем отправлять на клиент
// created in DTO next fields (поля)
module.exports = class UserDto {
    email; // email user
    id; // его ID
    isActivated; // флаг, который говорит об активации аккаунта

    constructor(model) { // создаем конструктор, который принимает параметром model.
        // Из него достаем поля, кот. нас интересуют:
        this.email = model.email; // email
        this.id = model._id; // MongoDB к id добавляет _, чтобы обозначить, что данное поле не изменяемое. Мы _ убираем
        this.isActivated = model.isActivated;
    }
}

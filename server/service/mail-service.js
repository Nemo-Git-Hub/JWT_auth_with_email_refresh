// -= server/service/mail-service.js =-

const nodemailer = require('nodemailer'); // импортируем для работы с почтовым сервисом

class MailService {

    constructor() { // создаем конструктор для инициализации почтового клиента
        this.transporter = nodemailer.createTransport({ // добавляем поле transporter, с помощью которого
            // будем отправлять письма на почту. Для этого вызываем функцию createTransport и указываем некоторые настройки:
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true, // true for 465, false for other ports
            auth: { // некоторая авторизационная информация об аккаунте, с которого будут отправляться письма.
                // Вся эта информация берется из настроек IMAP
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        })
    }

    // создаем функцию отправки письма для активации
    async sendActivationMail(to, link) { // (куда отправляем (адрес), ссылка которая будет отправляться)
        await this.transporter.sendMail({ // обращаемся к transporter и вызываем у него функцию sendMail,
            // которые параметром принимают {} со следующими полями:
            from: process.env.SMTP_USER, // от кого исходит письмо
            to, // кому письмо
            subject: 'Активация аккаунта на ' + process.env.API_URL, // тема письма
            text: '', // текст письма
            html:
                `
                    <div>
                        <h1>Для активации перейдите по ссылке</h1>
                        <a href="${link}">${link}</a>
                    </div>
                `
        })
    }
}

module.exports = new MailService();

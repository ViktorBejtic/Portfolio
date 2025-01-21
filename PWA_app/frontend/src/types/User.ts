export class User {
    id: number;
    login: string;
    email: string;
    password: string;

    constructor(id: number, login: string, email: string, password: string) {
        this.id = id;
        this.login = login;
        this.email = email;
        this.password = password;
    }
}

import {User} from './User.ts';

export class Message {
    id: number;
    text: string;
    user: User;
    timestamp: string;

    constructor(id: number, text: string, user: User, timestamp: string) {
        this.id = id;
        this.text = text;
        this.user = user;
        this.timestamp = timestamp;
    }
}
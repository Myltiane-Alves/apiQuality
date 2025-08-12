import axios from 'axios';
import 'dotenv/config';
const url = process.env.API_URL;

export class MovimentoCaixaClient {
    constructor(baseURL) {
        this.api = axios.create({
            baseURL: baseURL || url,
            timeout: 80000
        });
    }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable()
export class BuzzerService {
    private readonly buzzerUrl = '/api/buzzer';

    constructor(private httpClient : HttpClient) {}

    public hasBuzzer() {
        return this.httpClient.get(this.buzzerUrl);
    }

    public registerBuzzer(name : string) {
        return this.httpClient.post(this.buzzerUrl, { name : name });
    }

    public buzz() {
        return this.httpClient.get(`${this.buzzerUrl}/buzz`);
    }

    public whoBuzzed() {
        return this.httpClient.get(`${this.buzzerUrl}/who`);
    }

    public resetBuzzer() {
        return this.httpClient.get(`${this.buzzerUrl}/reset`);
    }
}
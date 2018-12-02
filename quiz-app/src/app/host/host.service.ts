import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';

@Injectable()
export class HostService {

    private readonly baseUrl = '/api/host';

    constructor(private httpClient : HttpClient) {}

    public givePoints(name : string, points : number) {
        return this.httpClient.post(`${this.baseUrl}/points`, { name : name, points : points });
    }
}
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class PubSubService {
    private params:any = {};
    private listSubject = {};   //list of behavior subject

    /**
     * send data base on pub/sub
     * @param key key pubsub
     * @param data data transfer
     */
    sendData(key:string, data:any) {
        if(this.listSubject[key] == null){
            this.listSubject[key] = new BehaviorSubject(this.params);
        }
        this.listSubject[key].next(data);
    }

    /**
     * get transfered data
     * @param key key pubsub
     */
    getData(key:string): Observable<any> {
        if(this.listSubject[key] == null){
            this.listSubject[key] = new BehaviorSubject(this.params);
        }
        return this.listSubject[key].asObservable();
    }
}
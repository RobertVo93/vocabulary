


import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import {Observable, BehaviorSubject, of} from "rxjs";
import {catchError, finalize} from "rxjs/operators";
import { Kanjis } from 'src/app/class/kanjis';
import { KanjiService } from 'src/app/component/data-management/kanji/kanji.service';

export class KanjisDataSource implements DataSource<Kanjis> {
    private kanjisSubject = new BehaviorSubject<Kanjis[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();
    constructor(private kanjisService: KanjiService) {

    }
    loadKanjis(courseId:number,
                filter:string,
                sortDirection:string,
                pageIndex:number,
                pageSize:number) {

        this.loadingSubject.next(true);
        this.kanjisService.getKanjisByFilter(courseId, filter, sortDirection,
            pageIndex, pageSize).pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe(kanjis => this.kanjisSubject.next(kanjis));
    }

    connect(collectionViewer: CollectionViewer): Observable<Kanjis[]> {
        console.log("Connecting kanji data");
        return this.kanjisSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.kanjisSubject.complete();
        this.loadingSubject.complete();
    }

    getKanjis(){
        return this.kanjisSubject.getValue();
    }

}


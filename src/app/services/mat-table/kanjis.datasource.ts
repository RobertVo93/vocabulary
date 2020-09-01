


import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { Observable, BehaviorSubject, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { Kanjis } from 'src/app/class/kanjis';
import { KanjiService } from 'src/app/component/data-management/kanji/kanji.service';
import { DataSourceResponse } from 'src/app/interface/dataSource.response';

export class KanjisDataSource implements DataSource<Kanjis> {
    private kanjisSubject = new BehaviorSubject<Kanjis[]>([]);
    private countSubject = new BehaviorSubject<number>(0);
    constructor(private kanjisService: KanjiService) {

    }
    loadKanjis(courseId: number, filter: string, sortActive: string, sortDirection: string, pageIndex: number, pageSize: number) {
        this.kanjisService.getKanjisByFilter(courseId, filter, sortActive, sortDirection,
            pageIndex, pageSize).pipe(
                catchError(() => of([]))
            )
            .subscribe((res: DataSourceResponse<Kanjis[]>) => {
                this.countSubject.next(res.count);
                this.kanjisSubject.next(res.data);
            });
    }

    connect(collectionViewer: CollectionViewer): Observable<Kanjis[]> {
        console.log("Connecting kanji data");
        return this.kanjisSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.kanjisSubject.complete();
        this.countSubject.complete();
    }

    getKanjis() {
        return this.kanjisSubject.getValue();
    }

    getCount() {
        return this.countSubject.getValue();
    }

}


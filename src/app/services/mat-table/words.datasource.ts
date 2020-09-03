import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { Observable, BehaviorSubject, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { Words } from 'src/app/class/words';
import { WordService } from 'src/app/component/data-management/word/word.service';
import { DataSourceResponse } from 'src/app/interface/dataSource.response';

export class WordsDataSource implements DataSource<Words> {
    private wordsSubject = new BehaviorSubject<Words[]>([]);
    private countSubject = new BehaviorSubject<number>(0);
    constructor(private wordsService: WordService) {

    }
    loadWords(courseId: string, filter: string, sortActive: string, sortDirection: string, pageIndex: number, pageSize: number) {
        this.wordsService.getWordsByFilter(courseId, filter, sortActive, sortDirection,
            pageIndex, pageSize).pipe(
                catchError(() => of([]))
            )
            .subscribe((res: DataSourceResponse<Words[]>) => {
                this.countSubject.next(res.count);
                this.wordsSubject.next(res.data);
            });
    }

    connect(collectionViewer: CollectionViewer): Observable<Words[]> {
        console.log("Connecting kanji data");
        return this.wordsSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.wordsSubject.complete();
        this.countSubject.complete();
    }

    getWords() {
        return this.wordsSubject.getValue();
    }

    getCount() {
        return this.countSubject.getValue();
    }

}


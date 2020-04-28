import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SatPopoverModule } from '@ncstate/sat-popover';
import { MatSortModule } from '@angular/material/sort';
import { FileUploadModule } from 'ng2-file-upload';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './component/header/header.component';
import { LeftComponent } from './component/body/left/left.component';
import { RightComponent } from './component/body/right/right.component';
import { AngularMaterialModule } from './angular-material.module';
import { PubSubService } from './services/data.service';
import { CommonService } from './services/common.service';
import { Config } from './configuration/config';
import { VocabularyComponent } from './component/training/vocabulary/vocabulary.component';
import { KanjiComponent } from './component/training/kanji/kanji.component';
import { ConvertToWordComponent } from './component/convert-excel/convert-to-word/convert-to-word.component';
import { ConvertToKanjiComponent } from './component/convert-excel/convert-to-kanji/convert-to-kanji.component';
import { KanjiManagementComponent } from './component/data-management/kanji-management/kanji-management.component';
import { InlineEditComponent } from './share-component/inline-edit/inline-edit.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TagsComponent } from './component/data-management/tag-management/tags.component';
import { CommonApiService } from './services/common-api.service';
import { CommonDialogComponent } from './share-component/common-dialog/common-dialog.component';
import { MatDialogModule } from '@angular/material';
import { DynamicFormComponent } from './share-component/dynamic-form/components/dynamic-form/dynamic-form.component';
import { DynamicFormQuestionComponent } from './share-component/dynamic-form/components/dynamic-form-question/dynamic-form-question.component';
import { UserManagementComponent } from './component/data-management/user-management/user-management.component';
import { DataSourcesComponent } from './component/data-management/data-sources/data-sources.component';
import { RoleComponent } from './component/data-management/role/role.component';
import { LanguageComponent } from './component/data-management/language/language.component';
import { LoginComponent } from './component/home/login/login.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { HomeComponent } from './component/home/home/home.component';
import { JwtInterceptor } from './services/authentication/jwt.interceptor';
import { ErrorInterceptor } from './services/authentication/error.interceptor';
import { AlertComponent } from './share-component/alert/alert.component';
import { WordComponent } from './component/data-management/word/word.component';
import { TrainWordComponent } from './component/training/train-word/train-word.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LeftComponent,
    RightComponent,
    VocabularyComponent,
    KanjiComponent,
    ConvertToWordComponent,
    ConvertToKanjiComponent,
    KanjiManagementComponent,
    InlineEditComponent,
    TagsComponent,
    CommonDialogComponent,
    DynamicFormComponent,
    DynamicFormQuestionComponent,
    UserManagementComponent,
    DataSourcesComponent,
    RoleComponent,
    LanguageComponent,
    LoginComponent,
    HomeComponent,
    AlertComponent,
    WordComponent,
    TrainWordComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    NgbModule,
    SatPopoverModule,
    MatSortModule,
    HttpClientModule,
    MatDialogModule,
    ReactiveFormsModule,
    AngularFontAwesomeModule,
    FileUploadModule
  ],
  providers: [
    PubSubService,
    CommonService,
    Config,
    CommonApiService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  entryComponents: [
    CommonDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

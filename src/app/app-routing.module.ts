import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TrainKanjiComponent } from './component/training/train-kanji/train-kanji.component';
import { ConvertToWordComponent } from './component/convert-excel/convert-to-word/convert-to-word.component';
import { ConvertToKanjiComponent } from './component/convert-excel/convert-to-kanji/convert-to-kanji.component';
import { TagsComponent } from './component/data-management/tag/tags.component';
import { UserManagementComponent } from './component/data-management/user/user-management.component';
import { DataSourcesComponent } from './component/data-management/data-sources/data-sources.component';
import { RoleComponent } from './component/data-management/role/role.component';
import { LanguageComponent } from './component/data-management/language/language.component';
import { LoginComponent } from './component/home/login/login.component';
import { HomeComponent } from './component/home/home/home.component';
import { AuthGuard } from './services/authentication/auth.guard';
import { WordComponent } from './component/data-management/word/word.component';
import { TrainWordComponent } from './component/training/train-word/train-word.component';
import { KanjiComponent } from './component/data-management/kanji/kanji.component';
import { ImagesComponent } from './component/data-management/images/images.component';
import { AboutComponent } from './component/about/about.component';
import { GrammarComponent } from './component/data-management/grammar/grammar.component';


const routes: Routes = [
  {canActivate: [AuthGuard], path: '', component: HomeComponent},
  {                          path: 'login', component: LoginComponent},
  {canActivate: [AuthGuard], path: 'import/word', component: ConvertToWordComponent},
  {canActivate: [AuthGuard], path: 'import/kanji', component: ConvertToKanjiComponent},
  {canActivate: [AuthGuard], path: 'train/word', component: TrainWordComponent},
  {canActivate: [AuthGuard], path: 'train/kanji', component: TrainKanjiComponent},
  {canActivate: [AuthGuard], path: 'management/kanji', component: KanjiComponent},
  {canActivate: [AuthGuard], path: 'management/word', component: WordComponent},
  {canActivate: [AuthGuard], path: 'management/tag', component: TagsComponent},
  {canActivate: [AuthGuard], path: 'management/user', component: UserManagementComponent},
  {canActivate: [AuthGuard], path: 'management/datasource', component: DataSourcesComponent},
  {canActivate: [AuthGuard], path: 'management/role', component: RoleComponent},
  {canActivate: [AuthGuard], path: 'management/language', component: LanguageComponent},
  {canActivate: [AuthGuard], path: 'management/image', component: ImagesComponent},
  {canActivate: [AuthGuard], path: 'management/grammar', component: GrammarComponent},
  {canActivate: [AuthGuard], path: 'about', component: AboutComponent},
  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

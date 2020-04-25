import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VocabularyComponent } from './component/training/vocabulary/vocabulary.component';
import { KanjiComponent } from './component/training/kanji/kanji.component';
import { ConvertToWordComponent } from './component/convert-excel/convert-to-word/convert-to-word.component';
import { ConvertToKanjiComponent } from './component/convert-excel/convert-to-kanji/convert-to-kanji.component';
import { KanjiManagementComponent } from './component/data-management/kanji-management/kanji-management.component';
import { WordManagementComponent } from './component/data-management/word-management/word-management.component';
import { TagsComponent } from './component/data-management/tag-management/tags.component';
import { UserManagementComponent } from './component/data-management/user-management/user-management.component';
import { DataSourcesComponent } from './component/data-management/data-sources/data-sources.component';
import { RoleComponent } from './component/data-management/role/role.component';
import { LanguageComponent } from './component/data-management/language/language.component';
import { LoginComponent } from './component/home/login/login.component';
import { HomeComponent } from './component/home/home/home.component';
import { AuthGuard } from './services/authentication/auth.guard';
import { WordComponent } from './component/data-management/word/word.component';


const routes: Routes = [
  {canActivate: [AuthGuard], path: '', component: HomeComponent},
  {                          path: 'login', component: LoginComponent},
  {canActivate: [AuthGuard], path: 'import/word', component: ConvertToWordComponent},
  {canActivate: [AuthGuard], path: 'import/kanji', component: ConvertToKanjiComponent},
  {canActivate: [AuthGuard], path: 'train/word', component: VocabularyComponent},
  {canActivate: [AuthGuard], path: 'train/kanji', component: KanjiComponent},
  {canActivate: [AuthGuard], path: 'management/kanji', component: KanjiManagementComponent},
  {canActivate: [AuthGuard], path: 'management/word', component: WordManagementComponent},
  {canActivate: [AuthGuard], path: 'management/tag', component: TagsComponent},
  {canActivate: [AuthGuard], path: 'management/user', component: UserManagementComponent},
  {canActivate: [AuthGuard], path: 'management/datasource', component: DataSourcesComponent},
  {canActivate: [AuthGuard], path: 'management/role', component: RoleComponent},
  {canActivate: [AuthGuard], path: 'management/language', component: LanguageComponent},
  {canActivate: [AuthGuard], path: 'management/wordv2', component: WordComponent},

  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

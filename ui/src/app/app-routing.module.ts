import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CallComponent } from './call/call.component';


const routes: Routes = [{path: 'call', component: CallComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

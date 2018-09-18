import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { StartComponent } from './start/start.component';
import { NewContractComponent } from './new-contract/new-contract.component';
import {UploadService} from "./upload.service";
import {HttpClientModule} from "@angular/common/http";

const appRoutes: Routes = [
  {
    path: 'new-contract',
    component: NewContractComponent
  },
  {
    path: 'start',
    component: StartComponent
  },
  { path: '',
    redirectTo: '/start',
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [
    AppComponent,
    StartComponent,
    NewContractComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    ReactiveFormsModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    )
  ],
  providers: [UploadService],
  bootstrap: [AppComponent]
})
export class AppModule { }

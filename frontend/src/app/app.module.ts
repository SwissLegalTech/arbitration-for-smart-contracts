import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {AppComponent} from './app.component';
import {StartComponent} from './start/start.component';
import {NewContractComponent} from './new-contract/new-contract.component';
import {UploadService} from './upload.service';
import {HttpClientModule} from '@angular/common/http';
import {NewContractSuccessComponent} from './new-contract-success/new-contract-success.component';
import {ContractDetailsComponent} from './contract-details/contract-details.component';
import {ContractService} from './contract.service';
import { ArbitrationComponent } from './arbitration/arbitration.component';

const appRoutes: Routes = [
  {
    path: 'contract/:id',
    component: ContractDetailsComponent
  },
  {
    path: 'contract/:id/arbitration',
    component: ArbitrationComponent
  },
  {
    path: 'new-contract/:id/success',
    component: NewContractSuccessComponent
  },
  {
    path: 'new-contract',
    component: NewContractComponent
  },
  {
    path: 'start',
    component: StartComponent
  },
  {
    path: '',
    redirectTo: '/start',
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [
    AppComponent,
    StartComponent,
    NewContractComponent,
    NewContractSuccessComponent,
    ContractDetailsComponent,
    ArbitrationComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    ReactiveFormsModule,
    RouterModule.forRoot(
      appRoutes,
      {enableTracing: true} // <-- debugging purposes only
    )
  ],
  providers: [UploadService, ContractService],
  bootstrap: [AppComponent]
})
export class AppModule {
}

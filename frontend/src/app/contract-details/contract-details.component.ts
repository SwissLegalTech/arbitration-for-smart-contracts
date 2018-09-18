import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ContractDetails, ContractService} from '../contract.service';
import {Subject} from 'rxjs';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-contract-details',
  templateUrl: './contract-details.component.html',
  styleUrls: ['./contract-details.component.css']
})
export class ContractDetailsComponent implements OnInit {
  public contractId: string;
  public contract$: Subject<ContractDetails> = new Subject();

  constructor(private route: ActivatedRoute, private contractService: ContractService, private sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.contract$.subscribe((data) => {
      for (let i = 0; i < data.files.length; i++) {
        const unsecureData: string = 'data:' + data.files[i].type + ';base64,' + String(data.files[i].data);
        data.files[i].data = this.sanitizer.bypassSecurityTrustResourceUrl(unsecureData);
      }
    });

    this.route.paramMap.subscribe((params) => {
      this.contractId = params.get('id');
      this.contractService.search(params.get('id')).subscribe(this.contract$);
    });
  }
}

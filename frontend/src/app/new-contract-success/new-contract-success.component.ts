import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-new-contract-success',
  templateUrl: './new-contract-success.component.html',
  styleUrls: ['./new-contract-success.component.css']
})
export class NewContractSuccessComponent implements OnInit {
  public contractId: string;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.contractId = params.get('id');
    });
  }

}

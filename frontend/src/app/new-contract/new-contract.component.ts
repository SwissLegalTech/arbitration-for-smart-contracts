import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MainTerm} from "./main-term.model";
import {UploadService} from "../upload.service";

@Component({
  selector: 'app-new-contract',
  templateUrl: './new-contract.component.html',
  styleUrls: ['./new-contract.component.css']
})
export class NewContractComponent implements OnInit {
  public newMainTermLabel: FormControl;
  public newMainTermDescription: FormControl;
  public contractType: FormControl;

  public agreementFilename: string;
  public mainTerms: Array<MainTerm>;

  @ViewChild('agreementFile')
  agreementFileChild;

  public agreementFile: File;

  constructor(private uploadService: UploadService) {
  }

  ngOnInit() {
    this.mainTerms = new Array<MainTerm>();

    this.newMainTermLabel = new FormControl('');
    this.newMainTermDescription = new FormControl('');
    this.contractType = new FormControl('');
  }

  public addMainTerm() {
    const label = this.newMainTermLabel.value;
    const description = this.newMainTermDescription.value;

    this.mainTerms.push({
      key: label.replace(/[^A-Za-z0-9]/g, "_").toLowerCase(),
      label: label,
      description: description
    });

    this.newMainTermLabel.reset();
    this.newMainTermDescription.reset();
  }

  public removeMainTerm(idx: number) {
    this.mainTerms.splice(idx, 1);
  }

  public fileChanged(fileInput: Event) {
    const files: { [key: string]: File } = this.agreementFileChild.nativeElement.files;

    for (let key in files) {
      if (!isNaN(parseInt(key))) {
        this.agreementFile = files[key];
      }
    }

    let file = (<any>fileInput.target).files[0];
    this.agreementFilename = file.name;
  }

  public saveAgreement() {
    let formData = new Map<string, string>();
    formData.set("type", this.contractType.value);
    formData.set("mainTerms", JSON.stringify(this.mainTerms));
    this.uploadService.upload(this.agreementFile, "new-contract", formData);
  }
}

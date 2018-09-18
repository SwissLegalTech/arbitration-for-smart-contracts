import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UploadService} from '../upload.service';
import {BehaviorSubject} from 'rxjs';
import {Router} from '@angular/router';

@Component({
  selector: 'app-new-contract',
  templateUrl: './new-contract.component.html',
  styleUrls: ['./new-contract.component.css']
})
export class NewContractComponent implements OnInit {
  public newMainTermLabel: FormControl;
  public newMainTermDescription: FormControl;
  public contractType: FormControl;
  public emailSeller: FormControl;
  public emailBuyer: FormControl;

  public agreementFilename: string;
  @ViewChild('agreementFile') agreementFileChild;
  public agreementFile: File;
  public agreementFileProgress$: BehaviorSubject<number> = new BehaviorSubject(0);

  public additionalFilename1: string;
  @ViewChild('additionalFile1') additionalFile1Child;
  public additionalFile1: File;
  public additionalFile1Progress$: BehaviorSubject<number> = new BehaviorSubject(0);

  public additionalFilename2: string;
  @ViewChild('additionalFile2') additionalFile2Child;
  public additionalFile2: File;
  public additionalFile2Progress$: BehaviorSubject<number> = new BehaviorSubject(0);

  public additionalFilename3: string;
  @ViewChild('additionalFile3') additionalFile3Child;
  public additionalFile3: File;
  public additionalFile3Progress$: BehaviorSubject<number> = new BehaviorSubject(0);

  constructor(private uploadService: UploadService, private router: Router) {
  }

  ngOnInit() {
    this.newMainTermLabel = new FormControl('');
    this.newMainTermDescription = new FormControl('');
    this.contractType = new FormControl('');
    this.emailBuyer = new FormControl('');
    this.emailSeller = new FormControl('');
  }

  public fileChanged(fileInput: Event) {
    const files: { [key: string]: File } = this.agreementFileChild.nativeElement.files;

    for (const key in files) {
      if (!isNaN(parseInt(key, 10))) {
        this.agreementFile = files[key];
      }
    }

    const file = (<any>fileInput.target).files[0];
    this.agreementFilename = file.name;
  }

  public additionalfile1Changed(fileInput: Event) {
    const files: { [key: string]: File } = this.additionalFile1Child.nativeElement.files;

    for (const key in files) {
      if (!isNaN(parseInt(key, 10))) {
        this.additionalFile1 = files[key];
      }
    }

    const file = (<any>fileInput.target).files[0];
    this.additionalFilename1 = file.name;
  }

  public additionalfile2Changed(fileInput: Event) {
    const files: { [key: string]: File } = this.additionalFile2Child.nativeElement.files;

    for (const key in files) {
      if (!isNaN(parseInt(key, 10))) {
        this.additionalFile2 = files[key];
      }
    }

    const file = (<any>fileInput.target).files[0];
    this.additionalFilename2 = file.name;
  }

  public additionalfile3Changed(fileInput: Event) {
    const files: { [key: string]: File } = this.additionalFile3Child.nativeElement.files;

    for (const key in files) {
      if (!isNaN(parseInt(key, 10))) {
        this.additionalFile3 = files[key];
      }
    }

    const file = (<any>fileInput.target).files[0];
    this.additionalFilename3 = file.name;
  }

  public saveAgreement() {
    const formData = new Map<string, string>();
    formData.set('type', this.contractType.value);
    formData.set('emailSeller', this.emailSeller.value);
    formData.set('emailBuyer', this.emailBuyer.value);

    const agreementUpload$ = this.uploadService.upload(this.agreementFile, 'new-contract', 'file', formData);
    agreementUpload$.progress$.subscribe(this.agreementFileProgress$);

    agreementUpload$.response.then((response) => {
      const docId = response.body.id;
      const additionalUploads = [];

      if (this.additionalFile1 && this.additionalFilename1 && this.additionalFilename1.length > 0) {
        const additionalFile1Upload = this.uploadService.upload(this.additionalFile1, `contract/${docId}`, 'file', formData);
        additionalFile1Upload.progress$.subscribe(this.additionalFile1Progress$);
        additionalUploads.push(additionalFile1Upload.response);
      }

      if (this.additionalFile2 && this.additionalFilename2 && this.additionalFilename2.length > 0) {
        const additionalFile2Upload = this.uploadService.upload(this.additionalFile2, `contract/${docId}`, 'file', formData);
        additionalFile2Upload.progress$.subscribe(this.additionalFile2Progress$);
        additionalUploads.push(additionalFile2Upload.response);
      }

      if (this.additionalFile3 && this.additionalFilename3 && this.additionalFilename3.length > 0) {
        const additionalFile3Upload = this.uploadService.upload(this.additionalFile3, `contract/${docId}`, 'file', formData);
        additionalFile3Upload.progress$.subscribe(this.additionalFile3Progress$);
        additionalUploads.push(additionalFile3Upload.response);
      }

      Promise.all(additionalUploads).then(() => {
        this.router.navigate(['new-contract', docId, 'success']);
      });
    });
  }
}

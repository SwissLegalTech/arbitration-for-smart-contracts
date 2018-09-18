import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css']
})
export class StartComponent implements OnInit {
  public contractLookup: FormControl;

  constructor(private router: Router) {
  }

  ngOnInit() {
    this.contractLookup = new FormControl('');
  }

  public navigate2Contract(event) {
    console.log('navigate!');
    this.router.navigate(['contract', this.contractLookup.value]);
  }
}

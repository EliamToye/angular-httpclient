import { Component, OnInit } from '@angular/core';
import { IndexedDbService } from '../indexed-db.service';
import { FormsModule } from '@angular/forms'; // Import FormsModule

@Component({
  selector: 'app-configuration',
  standalone: true,  // Make sure it's marked as standalone
  imports: [FormsModule],  // Import FormsModule to use ngModel
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {
  url: string = '';

  constructor(private indexedDbService: IndexedDbService) {}

  ngOnInit() {
    this.loadUrl();
  }

  async loadUrl() {
    const storedUrl = await this.indexedDbService.getUrl();
    if (storedUrl) {
      this.url = storedUrl;
    } else {
      this.url = '';
    }
  }

  async saveUrl() {
    if (this.url) {
      await this.indexedDbService.saveUrl(this.url);
      alert('URL saved successfully!');
    } else {
      alert('Please enter a valid URL');
    }
  }
}
import { HttpClient} from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-fetch',
  standalone: true,
  imports: [],
  providers: [],
  templateUrl: './fetch.component.html',
  styleUrl: './fetch.component.scss'
})
export class FetchComponent {

  fetch() {
    this.http.get('https://jsonplaceholder.typicode.com/posts').subscribe(data => {
      console.log(data);
    });
  }

  constructor(private http: HttpClient) {
   }

}

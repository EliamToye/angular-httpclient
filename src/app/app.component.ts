import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FetchComponent } from "./fetch/fetch.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FetchComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'angular-httpclient';
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IndexedDbService } from '../indexed-db.service'; // IndexedDB service

const httpoption = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Component({
  selector: 'app-fetch',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fetch.component.html',
  styleUrls: ['./fetch.component.scss'],
})
export class FetchComponent implements OnInit {
  lightsData: any[] = [];
  apiUrl: string | undefined = undefined;

  constructor(
    private http: HttpClient,
    private indexedDbService: IndexedDbService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUrl();
  }

  // Load the stored URL from IndexedDB
  async loadUrl() {
    this.apiUrl = await this.indexedDbService.getUrl();
    if (!this.apiUrl) {
      alert('Ga naar de configuratiepagina om je IP in te stellen.');
      this.router.navigate(['/configuration']);
    } else {
      this.fetchData();
    }
  }

  // Fetch data from the API
  fetchData() {
    if (!this.apiUrl) {
      console.error('Geen opgeslagen URL beschikbaar.');
      return;
    }

    const url = `${this.apiUrl}/api/newdeveloper/lights`;
    this.http.get(url, httpoption).subscribe(
      (data: any) => {
        console.log(data);
        this.lightsData = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  // Update brightness of a lamp
  updateBrightness(lightId: string, brightness: number) {
    if (!this.apiUrl) {
      console.error('Host/IP is vereist');
      return;
    }

    const url = `${this.apiUrl}/api/newdeveloper/lights/${lightId}/state`;
    const payload = { bri: brightness };

    this.http.put(url, JSON.stringify(payload), {
      headers: { 'Content-Type': 'application/json' },
    }).subscribe(
      (response) => console.log('Brightness updated:', response),
      (error) => console.error('Error updating brightness:', error)
    );
  }

  // Update lamp color
  updateColor(lightId: string, hexColor: string) {
    if (!this.apiUrl) {
      console.error('Host/IP is vereist');
      return;
    }

    const hue = this.hexToHue(hexColor);
    const url = `${this.apiUrl}/api/newdeveloper/lights/${lightId}/state`;
    const payload = { hue };

    this.http.put(url, JSON.stringify(payload), {
      headers: { 'Content-Type': 'application/json' },
    }).subscribe(
      (response) => console.log('Color updated:', response),
      (error) => console.error('Error updating color:', error)
    );
  }

  // Toggle light on/off
  toggleLamp(lightId: string, currentState: boolean) {
    if (!this.apiUrl) {
      console.error('Host/IP is vereist');
      return;
    }

    const url = `${this.apiUrl}/api/newdeveloper/lights/${lightId}/state`;
    const newState = { on: !currentState };

    this.http.put(url, JSON.stringify(newState), {
      headers: { 'Content-Type': 'application/json' },
    }).subscribe(
      (response) => {
        console.log('State updated:', response);
        const lamp = this.lightsData.find((light) => light.id === lightId);
        if (lamp) {
          lamp.state.on = !currentState;
        }
      },
      (error) => console.error('Error toggling state:', error)
    );
  }

  // Hex color conversion
  private hexToHue(hexColor: string): number {
    const rgb = this.hexToRgb(hexColor);
    const hsl = this.rgbToHsl(rgb[0], rgb[1], rgb[2]);
    return Math.round(hsl[0] * 65535);
  }

  private hexToRgb(hex: string): number[] {
    let r = 0,
      g = 0,
      b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }
    return [r, g, b];
  }

  private rgbToHsl(r: number, g: number, b: number): number[] {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    return [h, s, l];
  }
}
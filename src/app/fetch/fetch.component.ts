import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { Router } from '@angular/router'; // Import Router for navigation

const httpoption = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json', // Properly specify content type
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
  apiUrl = 'http://localhost:8000/api/newdeveloper/lights'; // Set static localhost API URL

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchData(); // Fetch data on initialization
  }

  // Fetch data from the API
  fetchData() {
    console.log(this.apiUrl);
    this.http.get(this.apiUrl, httpoption).subscribe(
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

  // Method to update the brightness
  updateBrightness(lightId: string, brightness: number) {
    const url = `${this.apiUrl}/${lightId}/state`;
    const payload = { bri: brightness };

    this.http
      .put(url, JSON.stringify(payload), {
        headers: { 'Content-Type': 'application/json' },
      })
      .subscribe(
        (response) => {
          console.log('Brightness updated:', response);
        },
        (error) => {
          console.error('Error updating brightness:', error);
        }
      );
  }

  // Method to update the color based on hex value from the color picker
  updateColor(lightId: string, hexColor: string) {
    const hue = this.hexToHue(hexColor); // Convert hex color to hue
    const url = `${this.apiUrl}/${lightId}/state`;
    const payload = { hue };

    this.http
      .put(url, JSON.stringify(payload), {
        headers: { 'Content-Type': 'application/json' },
      })
      .subscribe(
        (response) => {
          console.log('Color updated:', response);
        },
        (error) => {
          console.error('Error updating color:', error);
        }
      );
  }

  // Toggle light state (on/off)
  toggleLamp(lightId: string, currentState: boolean) {
    const url = `${this.apiUrl}/${lightId}/state`;
    const newState = { on: !currentState };

    this.http
      .put(url, JSON.stringify(newState), {
        headers: { 'Content-Type': 'application/json' },
      })
      .subscribe(
        (response) => {
          console.log('State updated:', response);
          const lamp = this.lightsData.find((light) => light.id === lightId);
          if (lamp) {
            lamp.state.on = !currentState;
          }
        },
        (error) => {
          console.error('Error toggling state:', error);
        }
      );
  }

  // Helper functions for color conversions (unchanged)
  hueToHex(hue: number): string {
    const hueNormalized = hue / 65535;
    const saturation = 1;
    const lightness = 0.5;
    const rgb = this.hslToRgb(hueNormalized, saturation, lightness);
    return this.rgbToHex(rgb);
  }

  private hslToRgb(h: number, s: number, l: number): number[] {
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  private rgbToHex(rgb: number[]): string {
    return '#' + rgb.map((x) => x.toString(16).padStart(2, '0')).join('');
  }

  private hexToHue(hexColor: string): number {
    const rgb = this.hexToRgb(hexColor);
    const hsl = this.rgbToHsl(rgb[0], rgb[1], rgb[2]);
    return Math.round(hsl[0] * 65535); // Convert hue to range 0-65535
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

    let max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max === min) {
      h = 0; // achromatic
    } else {
      let d = max - min;
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
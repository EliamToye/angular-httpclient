import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fetch',
  standalone: true,
  imports: [CommonModule],
  providers: [],
  templateUrl: './fetch.component.html',
  styleUrls: ['./fetch.component.scss']
})
export class FetchComponent {
  lightsData: any[] = [];

  constructor(private http: HttpClient) {}

  // Method to fetch data
  fetch() {
    this.http.get('http://localhost:80/api/newdeveloper/lights').subscribe(
      (data: any) => {
        console.log(data);
        this.lightsData = Object.values(data);
      },
      error => {
        console.error('Error fetching data:', error);
      }
    );
  }

  // Method to convert hue value to hex color
  hueToHex(hue: number): string {
    const hueNormalized = hue / 65535;
    const saturation = 1;  // Full saturation
    const lightness = 0.5; // Mid lightness for vibrant colors

    // Convert HSL to RGB
    const rgb = this.hslToRgb(hueNormalized, saturation, lightness);
    
    // Convert RGB to Hex
    return this.rgbToHex(rgb);
  }

  // Convert HSL to RGB
  private hslToRgb(h: number, s: number, l: number): number[] {
    let r, g, b;
    if (s == 0) {
      r = g = b = l; // Achromatic (gray)
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

  // Convert RGB to Hex
  private rgbToHex(rgb: number[]): string {
    return '#' + rgb.map(x => x.toString(16).padStart(2, '0')).join('');
  }
}
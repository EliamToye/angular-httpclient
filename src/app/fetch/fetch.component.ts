import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core'; // Added OnInit import
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { Router } from '@angular/router'; // Import Router for navigation
import { IndexedDbService } from '../indexed-db.service'; // Assuming service is imported correctly

@Component({
  selector: 'app-fetch',
  standalone: true,
  imports: [CommonModule, FormsModule], // FormsModule is already correctly imported
  templateUrl: './fetch.component.html',
  styleUrls: ['./fetch.component.scss']
})
export class FetchComponent implements OnInit {
  lightsData: any[] = [];
  apiUrl: string | undefined = undefined; // Allow undefined
  

  constructor(
    private http: HttpClient,
    private indexedDbService: IndexedDbService, // Service to handle IndexedDB interactions
    private router: Router // Router for navigation
  ) {}

  ngOnInit(): void {
    this.loadUrl(); // Load the URL from IndexedDB when the component is initialized
  }

  // Load the stored URL from IndexedDB
  async loadUrl() {
    this.apiUrl = await this.indexedDbService.getUrl(); // Get URL from IndexedDB
    if (!this.apiUrl) {
      alert('Go to the configuration page to set your IP');
      this.router.navigate(['/configuration']); // Redirect to the configuration page
    } else {
      this.fetchData(); // If URL exists, fetch the data
    }
  }

  // Fetch data from the API
  fetchData() {
    if (!this.apiUrl) {
      return; // If no URL, don't proceed
    }
    console.log(this.apiUrl)
    const baseUrl = this.apiUrl.split(':')[0]; // Remove port if any
    console.log(baseUrl)
    const url = `${baseUrl}:8000/api/newdeveloper/lights`; // Use the URL stored in IndexedDB
    console.log(url)

    this.http.get(url).subscribe(
      (data: any) => {
        console.log(data);
        // Map the data to format it for display
        this.lightsData = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  // Method to update the brightness
  updateBrightness(lightId: string, brightness: number) {
    if (!this.apiUrl) {
      console.error('Host/IP is required');
      return;
    }

    const baseUrl = this.apiUrl.split(':')[0]; // Remove port if any
    const url = `${baseUrl}/api/newdeveloper/lights/${lightId}/state`;
    const payload = { bri: brightness };

    this.http.put(url, JSON.stringify(payload), {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe(
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
    if (!this.apiUrl) {
      console.error('Host/IP is required');
      return;
    }

    const baseUrl = this.apiUrl.split(':')[0]; // Remove port if any
    const hue = this.hexToHue(hexColor); // Convert hex color to hue

    const url = `${baseUrl}/api/newdeveloper/lights/${lightId}/state`;
    const payload = { hue };

    this.http.put(url, JSON.stringify(payload), {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe(
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
    if (!this.apiUrl) {
      console.error('Host/IP is required');
      return;
    }

    const baseUrl = this.apiUrl.split(':')[0]; // Remove port if any
    const url = `${baseUrl}/api/newdeveloper/lights/${lightId}/state`;
    const newState = { on: !currentState };

    this.http.put(url, JSON.stringify(newState), {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe(
      (response) => {
        console.log('State updated:', response);
        // Toggle the local state
        const lamp = this.lightsData.find(light => light.id === lightId);
        if (lamp) {
          lamp.state.on = !currentState;
        }
      },
      (error) => {
        console.error('Error toggling state:', error);
      }
    );
  }

  // Helper functions for color conversions (e.g., hex to hue, RGB to HSL)
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
    return '#' + rgb.map(x => x.toString(16).padStart(2, '0')).join('');
  }

  private hexToHue(hexColor: string): number {
    const rgb = this.hexToRgb(hexColor);
    const hsl = this.rgbToHsl(rgb[0], rgb[1], rgb[2]);
    return Math.round(hsl[0] * 65535); // Convert hue to range 0-65535
  }

  private hexToRgb(hex: string): number[] {
    let r = 0, g = 0, b = 0;
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

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max === min) {
      h = 0; // achromatic
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }

      h /= 6;
    }

    return [h, s, l];
  }
}
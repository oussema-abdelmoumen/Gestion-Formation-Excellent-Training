import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private renderer: Renderer2;
  private _light = false;

  constructor(factory: RendererFactory2) {
    this.renderer = factory.createRenderer(null, null);
    const saved = localStorage.getItem('theme');
    this._light = saved === 'light';
    this.apply();
  }

  isLight(): boolean { return this._light; }

  toggle() {
    this._light = !this._light;
    localStorage.setItem('theme', this._light ? 'light' : 'dark');
    this.apply();
  }

  private apply() {
    const body = document.body;
    if (this._light) {
      this.renderer.addClass(body, 'light-theme');
      this.renderer.removeClass(body, 'dark-theme');
    } else {
      this.renderer.addClass(body, 'dark-theme');
      this.renderer.removeClass(body, 'light-theme');
    }
  }
}

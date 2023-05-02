import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private isDarkThemeSubject = new BehaviorSubject<boolean>(false);
  isDarkTheme = this.isDarkThemeSubject.asObservable();
  private readonly isDarkThemeKey = 'isDarkTheme';
  private readonly darkThemeClass = 'dark-theme';
  private readonly lightThemeClass = 'light-theme';

  constructor() {
    this.loadTheme();
  }

  setDarkTheme(isDarkTheme: boolean) {
    this.isDarkThemeSubject.next(isDarkTheme);
    localStorage.setItem(this.isDarkThemeKey, isDarkTheme ? 'true' : 'false');
    this.setThemeClass(isDarkTheme);
  }

  loadTheme() {
    const isDarkTheme = localStorage.getItem(this.isDarkThemeKey) !== 'false';
    this.setDarkTheme(isDarkTheme);
  }

  setThemeClass(isDarkTheme: boolean) {
    if (isDarkTheme) {
      document.body.classList.add(this.darkThemeClass);
      document.body.classList.remove(this.lightThemeClass);
    } else {
      document.body.classList.add(this.lightThemeClass);
      document.body.classList.remove(this.darkThemeClass);
    }
  }
}

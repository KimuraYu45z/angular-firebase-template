import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
import {
  ActivatedRoute,
  Router,
  NavigationEnd
} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  baseTitle: string;

  private title$_: BehaviorSubject<string>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private title: Title
  ) {
    this.baseTitle = '';
    this.title$_ = new BehaviorSubject('');

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.route),
        map(route => {
          while (route.firstChild) route = route.firstChild;
          return route;
        }),
        filter(route => route.outlet === 'primary'),
        mergeMap(route => route.data)
      )
      .subscribe(event => {
        this.setTitle(event['title']);
      });
  }

  getTitle(): string {
    return this.title.getTitle();
  }

  setTitle(title?: string) {
    if (this.baseTitle && title) {
      this.title.setTitle(title + ' - ' + this.baseTitle);
    } else {
      this.title.setTitle(this.baseTitle || title || '');
    }
    this.title$_.next(title || '');
  }

  get title$() {
    return this.title$_.asObservable();
  }
}

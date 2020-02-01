import { InjectionToken } from '@angular/core';

export const CONFIG = new InjectionToken<Config>('config');

export interface Config {
  algolia?: {
    app_id: string;
    search_api_key: string;
  };
  stripe?: {
    pk: string;
  };
}

import { Injectable, Inject } from '@angular/core';
import algoliasearch, { AlgoliaSearchOptions } from 'algoliasearch';
import { CONFIG, Config } from '../types/config';

@Injectable({
  providedIn: 'root',
})
export class AlgoliaService {
  constructor(
    @Inject(CONFIG)
    private config: Config,
  ) {}

  async search<T>(
    indexName: string,
    query: string,
    options: AlgoliaSearchOptions,
  ) {
    if (!this.config.algolia) {
      throw Error('config.alogolia is undefined');
    }

    const client = algoliasearch(
      this.config.algolia['app_id'],
      this.config.algolia['search_api_key'],
    );

    const index = client.initIndex(indexName);
    const res = await index.search<T>(query, options);
    return {
      total: res.nbHits,
      hits: res.hits,
    };
  }
}

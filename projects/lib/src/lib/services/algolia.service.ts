import { Injectable, Inject } from '@angular/core';
import algoliasearch from 'algoliasearch';
import { RequestOptions } from '@algolia/transporter';
import { SearchOptions } from '@algolia/client-search';
import { CONFIG, Config } from '../config';

export class ErrorAlgoliaConfigUndefined extends Error {}

@Injectable({
  providedIn: 'root',
})
export class AlgoliaService {
  constructor(
    @Inject(CONFIG)
    private config: Config,
  ) {}

  /**
   *
   * @param indexName
   * @param query
   * @param options
   * @throws `ErrorAlgoliaConfigUndefined`
   */
  async search<T>(
    indexName: string,
    query: string,
    requestOptions?: (RequestOptions & SearchOptions) | undefined,
  ) {
    if (!this.config.algolia) {
      throw new ErrorAlgoliaConfigUndefined();
    }

    const client = algoliasearch(
      this.config.algolia.app_id,
      this.config.algolia.search_api_key,
    );

    const index = client.initIndex(indexName);
    const res = await index.search<T>(query, requestOptions);

    return res;
  }
}

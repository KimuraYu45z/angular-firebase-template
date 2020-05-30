import { filter } from 'rxjs/operators';
import { Observable } from 'rxjs';

function inputIsNotNull<T>(input: null | undefined | T): input is T {
  return input !== null && input !== undefined;
}

export function isNotNull<T>() {
  return (source$: Observable<null | undefined | T>) =>
    source$.pipe(filter(inputIsNotNull));
}

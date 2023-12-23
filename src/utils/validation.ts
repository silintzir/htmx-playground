import { ErrorResult, errorMessagesFor } from 'domain-functions';
import { zipObject, reduce, map, uniq, first } from 'lodash-es';

export function parseDomainErrors(result: ErrorResult) {
  const keys = uniq(
    reduce(
      result.inputErrors,
      (acc, cur) => {
        acc.push(...cur.path);
        return acc;
      },
      [] as string[],
    ),
  );

  return zipObject(
    keys,
    map(keys, (k) => first(errorMessagesFor(result.inputErrors, k))),
  );
}

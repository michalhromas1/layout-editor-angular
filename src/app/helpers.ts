export function makeImmutable<T>(what: T): Readonly<T> {
  return Object.freeze(what);
}

export function getNestedProperties<T>(
  of: T,
  childrenKey: string,
  propertiesToGet: string[] = []
): Partial<T> {
  return traverse<T>(of);

  function traverse<T>(current: Partial<T>): Partial<T> {
    let result = {};
    result[childrenKey] = [];

    for (const prop of propertiesToGet) {
      result[prop] = current[prop];
    }

    if (current[childrenKey]?.length) {
      result[childrenKey] = current[childrenKey].map((child) =>
        traverse(child)
      );
    }

    return result;
  }
}

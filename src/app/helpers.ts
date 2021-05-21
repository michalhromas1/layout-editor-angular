export function makeImmutable<T>(what: T): Readonly<T> {
  return Object.freeze(what);
}

export function getNestedProperties<T>(
  of: T,
  childrenKey: string,
  propertiesToGet: { key: string; fn?: (child: Partial<T>) => any }[] = []
): Partial<T> {
  return traverse<T>(of);

  function traverse<T>(current: Partial<T>): Partial<T> {
    let result = {};
    result[childrenKey] = [];

    for (const prop of propertiesToGet) {
      result[prop.key] = prop.fn ? prop.fn(current as any) : current[prop.key];
    }

    if (current[childrenKey]?.length) {
      result[childrenKey] = current[childrenKey].map((child: T) =>
        traverse(child)
      );
    }

    return result;
  }
}

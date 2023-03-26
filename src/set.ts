export function setIntersect<T>(a: Set<T>, b: Set<T>): Set<T> {
    const intersection = new Set<T>();
    for (const e of a.values()) {
        if (b.has(e)) intersection.add(e);
    }

    return intersection;
}

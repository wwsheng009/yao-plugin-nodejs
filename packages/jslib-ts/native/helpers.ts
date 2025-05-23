export function toChunks<T>(arr: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_v, i) =>
        arr.slice(i * size, i * size + size)
    );
}
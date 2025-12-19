
export function getLocalEmbedding(text: string): number[] {
    const VECTOR_SIZE = 384;
    const embedding = new Array(VECTOR_SIZE).fill(0);

    const tokens = text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter(Boolean);

    for (let i = 0; i < tokens.length && i < 100; i++) {
        const token = tokens[i];
        let hash = 0;
        for (let j = 0; j < token.length; j++) {
            hash = (hash * 31 + token.charCodeAt(j)) >>> 0;
        }
        const index = hash % VECTOR_SIZE;
        embedding[index] += 1;
    }

    // normalize
    const norm = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0)) || 1;
    return embedding.map(v => v / norm);
}
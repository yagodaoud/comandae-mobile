export function formatBRL(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function parseBRL(value: string): number {
    // Remove all non-digit and non-comma/dot characters
    const cleaned = value.replace(/[^\d,\.]/g, '');
    // Replace comma with dot for decimal
    const normalized = cleaned.replace(',', '.');
    return parseFloat(normalized);
} 
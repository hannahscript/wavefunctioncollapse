export function weightedChoice(weights: number[]): number {
    const max = weights.reduce((a, b) => a + b);
    
    let cum = 0;
    const n = Math.random() * max;
    for (let i = 0; i < weights.length; i++) {
        if (weights[i] === 0) continue;
        
        cum += weights[i];
        if (n < cum) {
            return i;
        }
    }
    
    return weights.length - 1;
}

export function weightedChoiceFromMap<T>(items: T[], weights: Map<T, number>): T {
    const orderedWeights = items.map(item => weights.get(item)!);
    return items[weightedChoice(orderedWeights)];
}

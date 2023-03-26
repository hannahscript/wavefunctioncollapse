import {Cell, Tile} from './wave.js';
import {Direction, dxyToDirection, flipDirection, getDirection} from './direction.js';

export interface Rule {
    on: Tile;
    direction: Direction;
    allowed: Tile;
}

function nextTo(on: Tile, allowed: Tile, direction: Direction): Rule[] {
    return [{on, allowed, direction}, {on: allowed, allowed: on , direction: flipDirection(direction)}];
}

function nextToAny(on: Tile, allowed: Tile): Rule[] {
    return [Direction.UP, Direction.RIGHT, Direction.DOWN, Direction.LEFT].map(direction => ({on, allowed, direction}));
}

function nextToAnyOf(on: Tile, alloweds: Tile[]): Rule[] {
    return combineRules(
        ...alloweds.map(allowed => nextToAny(on, allowed))
    );
}

function combineRules(...nestedRules: Rule[][]): Rule[] {
    return nestedRules.reduce((acc, curr) => acc.concat(curr));
}

// I wish js sets didnt suck
function addRule(rule: Rule, rules: Rule[]) {
    if (!rules.find(r => r.on === rule.on && r.direction === rule.direction && r.allowed === rule.allowed)) {
        rules.push(rule);
    }
}

function getTile(cell: Cell): Tile {
    return Array.from(cell.superposition)[0];
}

export function inferRules(grid: Tile[][]): Rule[] {
    const rules: Rule[] = [];
    const height = grid.length;
    const width = grid[0].length;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const cell = grid[y][x];
            for (const p of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
                const nx = x + p[0];
                const ny = y + p[1];
                
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const nb = grid[ny][nx];
                    addRule({on: cell, direction: dxyToDirection(p[0], p[1]), allowed: nb}, rules);
                }
            }
        }
    }
    
    return rules;
}

export function getWeights(grid: Tile[][]): Map<Tile, number> {
    const weights = new Map<Tile, number>();
    const height = grid.length;
    const width = grid[0].length;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const tile = grid[y][x];
            const n = weights.get(tile) || 0;
            weights.set(tile, n + 1);
        }
    }

    return weights;
}

export const directionalForestBeachRules = combineRules(
    nextToAnyOf(Tile.GRASS, [Tile.GRASS, Tile.TREE, Tile.SHORE_IN]),
    nextToAny(Tile.TREE, Tile.GRASS),
    nextToAny(Tile.SHORE_IN, Tile.GRASS),

    nextToAny(Tile.SHORE_IN, Tile.SHORE_IN),
    nextTo(Tile.SHORE_IN, Tile.SHORE_LEFT, Direction.RIGHT),
    nextTo(Tile.SHORE_IN, Tile.SHORE_LEFT, Direction.UP),
    nextTo(Tile.SHORE_IN, Tile.SHORE_LEFT, Direction.DOWN),
    
    
    nextTo(Tile.SHORE_IN, Tile.SHORE_RIGHT, Direction.LEFT),
    nextTo(Tile.SHORE_IN, Tile.SHORE_RIGHT, Direction.UP),
    nextTo(Tile.SHORE_IN, Tile.SHORE_RIGHT, Direction.DOWN),
    
    nextTo(Tile.SHORE_IN, Tile.SHORE_ABOVE, Direction.DOWN),
    nextTo(Tile.SHORE_IN, Tile.SHORE_ABOVE, Direction.LEFT),
    nextTo(Tile.SHORE_IN, Tile.SHORE_ABOVE, Direction.RIGHT),
    
    nextTo(Tile.SHORE_IN, Tile.SHORE_BELOW, Direction.UP),
    nextTo(Tile.SHORE_IN, Tile.SHORE_BELOW, Direction.LEFT),
    nextTo(Tile.SHORE_IN, Tile.SHORE_BELOW, Direction.RIGHT),
    // nextToAnyOf(Tile.SHORE_IN, [Tile.SHORE_BELOW, Tile.SHORE_ABOVE, Tile.SHORE_RIGHT, Tile.SHORE_LEFT]),
    // nextToAny(Tile.SHORE_LEFT, Tile.SHORE_IN),
    // nextToAny(Tile.SHORE_RIGHT, Tile.SHORE_IN),
    // nextToAny(Tile.SHORE_BELOW, Tile.SHORE_IN),
    // nextToAny(Tile.SHORE_ABOVE, Tile.SHORE_IN),
    

    nextToAny(Tile.WATER, Tile.WATER),
    nextTo(Tile.SHORE_LEFT, Tile.WATER, Direction.RIGHT),
    
    nextTo(Tile.SHORE_RIGHT, Tile.WATER, Direction.LEFT),
    
    nextTo(Tile.SHORE_ABOVE, Tile.WATER, Direction.DOWN),
    nextTo(Tile.SHORE_ABOVE, Tile.WATER, Direction.LEFT),
    nextTo(Tile.SHORE_ABOVE, Tile.WATER, Direction.RIGHT),
    
    nextTo(Tile.SHORE_BELOW, Tile.WATER, Direction.UP),
    nextTo(Tile.SHORE_BELOW, Tile.WATER, Direction.LEFT),
    nextTo(Tile.SHORE_BELOW, Tile.WATER, Direction.RIGHT),

    nextTo(Tile.SHORE_BELOW, Tile.SHORE_BELOW, Direction.LEFT),
    nextTo(Tile.SHORE_ABOVE, Tile.SHORE_ABOVE, Direction.LEFT),
    nextTo(Tile.SHORE_LEFT, Tile.SHORE_LEFT, Direction.UP),
    nextTo(Tile.SHORE_RIGHT, Tile.SHORE_RIGHT, Direction.UP),
);



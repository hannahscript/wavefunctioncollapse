import {setIntersect} from './set.js';
import {Direction, getDirection} from './direction.js';
import {Rule} from './rules.js';
import {weightedChoiceFromMap} from './util.js';

export enum Tile {
    GRASS,
    TREE,
    WATER,
    SHORE_IN,
    SHORE_LEFT,
    SHORE_RIGHT,
    SHORE_ABOVE,
    SHORE_BELOW,
    ERROR
}

export function getTileColor(tile: Tile): string {
    switch (tile) {
        case Tile.GRASS:
            return 'green';
        case Tile.TREE:
            return 'darkgreen';
        case Tile.WATER:
            return 'blue';
        case Tile.SHORE_IN:
            return 'beige';
        case Tile.ERROR:
            return 'red';
        default:
            return 'lightblue';
    }
}

function assert(msg: string, p: boolean) {
    if (!p) {
        throw new Error(`Assertion failure: ${msg}`);
    }
}

export class Cell {
    public superposition: Set<Tile>;

    constructor(public x: number, public y: number) {
        this.superposition = new Set([    
            Tile.WATER,
            Tile.TREE,
            Tile.SHORE_IN,
            Tile.SHORE_LEFT,
            Tile.SHORE_RIGHT,
            Tile.SHORE_ABOVE,
            Tile.SHORE_BELOW, Tile.GRASS]);
    }
}

function pickRandom<T>(items: T[]): T {
    if (items.length < 1) throw new Error('Array is empty');
    return items[Math.floor(Math.random() * items.length)];
}

function filter<T>(list: T[], minus: T[], eq: (a: T, b: T) => boolean): T[] {
    return list.filter(e => !minus.some(o => eq(e, o)));
}

export class WaveFunctionCollapse {
    private cells: Cell[][] = [];

    constructor(private width: number, private height: number, private rules: Rule[], private weights: Map<Tile, number>) {
        this.createInitialGrid();
    }

    tryCollapse(maxIterations: number): Cell[][] | null {
        for (let i = 0; i < maxIterations; i++) {
            try {
                return this.collapseGrid();
            } catch (err) {
                this.cells = [];
                this.createInitialGrid();
            }
        }

        return null;
    }

    step() {
        if (this.isCollapsed()) return true;

        const cell = this.getLeastEntropyCell();
        this.collapse(cell);
        const neighbours = this.getNeighbours(cell);
        this.propagateCollapse(neighbours, [cell]);
        
        return false;
    }

    getCells(): Cell[][] {
        return this.cells;
    }

    private collapseGrid(): Cell[][] {
        while (!this.step()) {
        }
        
        return this.getCells();
    }
    
    private createInitialGrid() {
        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                row.push(new Cell(x, y));
            }
            this.cells.push(row);
        }
    }

    private getLeastEntropyCell(): Cell {
        let mins: Cell[] = [];
        let min = 999;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const len = this.cells[y][x].superposition.size;
                if (len == 1) continue;
                if (len < min) {
                    mins = [this.cells[y][x]];
                    min = len;
                } else if (len == min) {
                    mins.push(this.cells[y][x])
                }
            }
        }

        return pickRandom(mins);
    }

    getNeighbours(cell: Cell): Cell[] {
        const neighbours = [];

        for (const p of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
            const x = cell.x + p[0];
            const y = cell.y + p[1];
            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                neighbours.push(this.cells[y][x]);
            }
        }

        assert('neighbours arent undefined', neighbours.every(n => n !== undefined))
        return neighbours;
    }

    isCollapsed(): boolean {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.cells[y][x].superposition.size > 1) {
                    return false;
                }
            }
        }

        return true;
    }

    private collapse(cell: Cell) {
        cell.superposition = new Set([weightedChoiceFromMap(Array.from(cell.superposition), this.weights)]);
    }

    // Returns its neighbours if it collapsed, empty array if it was unchanged
    restrict(cell: Cell): Cell[] {
        const previousSize = cell.superposition.size;
        // Already collapsed
        if (previousSize === 1) return [];
        const neighbours = this.getNeighbours(cell);
        const neighboursAdjacents = neighbours.map(nb => this.getAllowedAdjacents(nb, getDirection(nb, cell)));

        let newPosition = new Set(cell.superposition);
        for (const nba of neighboursAdjacents) {
            newPosition = setIntersect(newPosition, nba);
            if (newPosition.size < 1) {
                cell.superposition = new Set([Tile.ERROR]);
                throw new Error('cell collapsed into impossible state')
            }
        }

        cell.superposition = newPosition;
        return previousSize > cell.superposition.size ? neighbours : [];
    }

    private propagateCollapse(working: Cell[], visited: Cell[]) {
        while (working.length > 0) {
            const cell = working.shift()!;
            const neighbours = this.restrict(cell);
            const nextWorking = filter(neighbours, [...visited, ...working], (a, b) => a.x === b.x && a.y === b.y);
            visited.push(cell);
            working = [...working, ...nextWorking];
        }
    }

    private getAllowedAdjacents(cell: Cell, direction: Direction): Set<Tile> {
        const alloweds = new Set<Tile>();
        this.rules
            .filter(rule => cell.superposition.has(rule.on) && rule.direction === direction)
            .map(rule => rule.allowed)
            .forEach(t => alloweds.add(t));

        return alloweds;
    }
}


/*
getAllowedAdjacents(Cell, Direction)
Direction.flip
collapse(Cell)
restrict(Cell, State)
propagateCollapse(Cell[], Cell[], State)
getLeastEntropy(State)
isCollapsed(State)
 */

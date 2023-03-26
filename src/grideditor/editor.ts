import {Cell, getTileColor, Tile} from '../wave.js';

interface Point {
    x: number;
    y: number;
}

export class GridEditor {
    private static readonly DIM = 16;

    // @ts-ignore
    private ctx: CanvasRenderingContext2D;
    // @ts-ignore
    private grid: Tile[][];
    private currentTile = Tile.GRASS;

    constructor(private width: number, private height: number, private canvas: HTMLCanvasElement) {
        this.initGrid();
        this.attach(canvas);
        this.render();
    }

    attach(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d')!;

        this.canvas.addEventListener('mousedown', (ev) => {
            const canvasCoordinates = this.getCanvasCoordinates(ev);
            const tileCoordinates = this.getTileCoordinates(canvasCoordinates);
            this.handleClick(tileCoordinates);
        });

        this.canvas.addEventListener('mouseup', (ev) => {
            this.render();
        });

        this.canvas.addEventListener('mousemove', (ev) => {
            if (ev.buttons) {
                const canvasCoordinates = this.getCanvasCoordinates(ev);
                const tileCoordinates = this.getTileCoordinates(canvasCoordinates);
                this.handleClick(tileCoordinates);
            }
        });
    }

    pickTile(tile: Tile) {
        this.currentTile = tile;
    }

    render() {
        console.log('render')

        // Draw cells
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.ctx.fillStyle = getTileColor(this.grid[y][x]);
                this.ctx.fillRect(x * GridEditor.DIM, y * GridEditor.DIM, GridEditor.DIM, GridEditor.DIM);
            }
        }

        // Draw grid
        this.ctx.strokeStyle = 'black';
        for (let y = 1; y < this.height; y++) {
            for (let x = 1; x < this.width; x++) {
                this.ctx.moveTo(0, y * GridEditor.DIM);
                this.ctx.lineTo(this.width * GridEditor.DIM, y * GridEditor.DIM);
                this.ctx.moveTo(x * GridEditor.DIM, 0);
                this.ctx.lineTo(x * GridEditor.DIM, this.height * GridEditor.DIM);
            }
        }
        this.ctx.stroke();
    }

    getGrid(): Tile[][] {
        return this.grid;
    }

    private drawCell({x, y}: Point) {
        // Draw cell
        this.ctx.fillStyle = getTileColor(this.grid[y][x]);
        this.ctx.fillRect(x * GridEditor.DIM, y * GridEditor.DIM, GridEditor.DIM, GridEditor.DIM);

        // Fix up grid
        this.ctx.strokeStyle = 'black';
        for (let dy = y; dy < y + 1; dy++) {
            for (let dx = x; dx < x + 1; dx++) {
                this.ctx.moveTo(0, dy * GridEditor.DIM);
                this.ctx.lineTo(this.width * GridEditor.DIM, dy * GridEditor.DIM);
                this.ctx.moveTo(dx * GridEditor.DIM, 0);
                this.ctx.lineTo(dx * GridEditor.DIM, this.height * GridEditor.DIM);
            }
        }
        this.ctx.stroke();
    }

    private handleClick(p: Point) {
        console.log(`Tile clicked: x${p.x}/y${p.y}`);
        this.paintCell(p);
        // if (rerender) this.render();
        this.drawCell(p);
    }

    private getCanvasCoordinates(ev: MouseEvent): Point {
        const rect = this.canvas.getBoundingClientRect();
        return {x: ev.clientX - rect.left, y: ev.clientY - rect.top};
    }

    private getTileCoordinates(p: Point): Point {
        return {x: Math.floor(p.x / GridEditor.DIM), y: Math.floor(p.y / GridEditor.DIM)};
    }

    private initGrid() {
        this.grid = new Array(this.height);
        for (let y = 0; y < this.height; y++) {
            const row = new Array(this.width);
            this.grid[y] = row;
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = this.currentTile;
            }
        }
    }

    private paintCell(p: Point) {
        this.grid[p.y][p.x] = this.currentTile;
    }
}

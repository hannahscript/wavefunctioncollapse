import {getTileColor, Tile, WaveFunctionCollapse} from './wave.js';
import {directionalForestBeachRules, getWeights, inferRules} from './rules.js';
import {GridEditor} from './grideditor/editor.js';

/* COMMON */


/* EDITOR */

const editorCanvas = document.getElementById('editor_canvas') as HTMLCanvasElement;
const editor = new GridEditor(40, 40, editorCanvas);
createEditorButtons();

function createEditorButtons() {
    const host = document.getElementById('editor_buttons')!;

    const tiles = Object.keys(Tile).filter(k => !isNaN(+k)).map(k => +k as Tile);
    for (const tile of tiles) {
        const btn = document.createElement('button');
        btn.style.backgroundColor = getTileColor(tile);
        btn.innerText = Tile[tile];
        btn.addEventListener('click', () => editor.pickTile(tile));
        host.appendChild(btn);
    }
}

/* WFC */

const DIM = 8;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

let weights = new Map<Tile, number>();
weights.set(Tile.GRASS, 200);
weights.set(Tile.TREE, 50);
weights.set(Tile.WATER, 200);
weights.set(Tile.SHORE_IN, 50);
weights.set(Tile.SHORE_LEFT, 20);
weights.set(Tile.SHORE_RIGHT, 10);
weights.set(Tile.SHORE_ABOVE, 10);
weights.set(Tile.SHORE_BELOW, 10);


console.log(directionalForestBeachRules.filter(rule => rule.on === Tile.GRASS));
let rules = directionalForestBeachRules;
let wfc = new WaveFunctionCollapse(80, 80, rules, weights);
wfc.tryCollapse(100);
let cells = wfc.getCells();
//console.log('shore ' + count(cells, Tile.SHORE_LEFT));
// console.log('Sand ' + count(cells, Tile.SAND));
render();
document.getElementById('next')!.onclick = function () {
    console.log('clicked')
    wfc.step();
    console.log(wfc.getCells())
    cells = wfc.getCells();
    render();
};

document.getElementById('infer')!.onclick = function () {
    console.log('inferring ...')
    rules = inferRules(editor.getGrid());
    weights = getWeights(editor.getGrid());
    wfc = new WaveFunctionCollapse(80, 80, rules, weights);
    wfc.tryCollapse(100);
    cells = wfc.getCells();
    render();
    console.log('inferred.');
};

document.getElementById('regenerate')!.onclick = function () {
    wfc = new WaveFunctionCollapse(80, 80, rules, weights);
    wfc.tryCollapse(100);
    cells = wfc.getCells();
    render();
};

function render() {
    const height = cells.length;
    const width = cells[0].length;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const cell = cells[y][x];

            // todo this shit is horrible what were you thinking
            if (cell.superposition.size > 1) {
                ctx.fillStyle = 'white';
            } else {
                ctx.fillStyle = getTileColor(Array.from(cell.superposition)[0]);
            }


            ctx.fillRect(x * DIM, y * DIM, DIM, DIM);
            //ctx.strokeText(String(cell.superposition.size), x * DIM + DIM / 2, y * DIM + DIM / 2);
        }
    }
}


function loop() {

    // try {
    //     for (let i = 0; i < 10; i++) {
    //         wfc.step();
    //     }
    // } catch (err) {
    //     render();
    //     return;
    // }
    //
    //
    // render();


    requestAnimationFrame(loop);
}

console.log('loaded')
//loop();

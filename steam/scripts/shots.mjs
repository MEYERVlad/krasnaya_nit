// Состояния игры для скриншотов магазинов (Steam, RuStore).
export const KEYS = { 1: 'krasnaya-nit-ch1-v1', 2: 'krasnaya-nit-ch2-v1', 3: 'krasnaya-nit-ch3-v1', 4: 'krasnaya-nit-ch4-v1' };
const CH1 = { ch: 3, cm: 3, bag: [0, 0, 0], slots: [null, null, null, null], linked: {}, shot: {}, talk: {}, touched: 1 };
export const SHOTS = [
  ['01-room', 1, { scene: 'room', inv: ['magnifier', 'key'], f: { ...CH1, magTaken: 1, keyTaken: 1, clockOpen: 1, ch: 9, cm: 8 } }],
  ['02-dinner', 1, { scene: 'dinner', inv: ['magnifier', 'camera', 'ph_doctor'], f: { ...CH1, visited: 1, cameraTaken: 1, shot: { doctor: 1 } } }],
  ['03-board', 1, { scene: 'board', inv: [], f: { ...CH1, ended: 1, sixth: 1, centerLinked: 1, slots: ['doctor', 'pickman', 'lady', 'butler'], linked: { doctor: 'vial', pickman: 'page', lady: 'note', butler: 'glove' } } }],
  ['04-newsroom-1953', 2, { scene: 'office53', inv: ['faceless', 'magnifier', 'group'], f: { touched: 1, tl: [null, null, null, null], dev: 0, took: {}, talk: {}, groupTaken: 1, visited: 1 } }],
  ['05-darkroom', 2, { scene: 'darkroom', inv: ['magnifier', 'letter'], f: { touched: 1, tl: [null, null, null, null], dev: 3, took: {}, talk: {}, red: 1, printed: 1, labOpen: 1, filmTaken: 1 } }],
  ['06-rook-wall', 2, { scene: 'rookboard', inv: ['magnifier'], f: { touched: 1, tl: ['pr1', 'pr2', 'pr3', 'pr4'], dev: 3, took: {}, talk: {}, ring: 1, crest: 1, curtain: 1, printed: 1 } }],
  ['07-orphanage-1931', 3, { scene: 'dorm31', inv: ['ringphoto', 'magnifier', 'boxphoto'], f: { lk: [1, 1], talk: {}, touched: 1, visited: 1 } }],
  ['08-orphanage', 3, { scene: 'dorm', inv: ['ringphoto', 'magnifier', 'poker'], f: { lk: [1, 1], talk: {}, touched: 1, pokerTaken: 1, boxOpen: 1 } }],
  ['09-dinner-1975', 4, { scene: 'dinner75', inv: ['invite75', 'ring9', 'magnifier'], f: { talk: {}, acc: {}, touched: 1 } }],
  ['10-cellar-1953', 4, { scene: 'cellar53', inv: ['ledger', 'rookcam', 'lantern'], f: { talk: {}, acc: {}, touched: 1, rackOpen: 1, visited: 1 } }]
];


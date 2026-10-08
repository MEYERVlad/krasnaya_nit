// Раскадровка тизера «Красная нить». Время — в секундах.
// Кадр: img — плита из plates/, a/b — начало и конец, from/to — [cx, cy, zoom] (центр кадра в долях плиты, zoom 1 = по ширине экрана).
// grade — цветокоррекция, fx — дождь / свечи / пыль, fade — длительность наплыва.
var TIMELINE = {
  duration: 72,
  shots: [
    { img: 'clock',    a: 1.0,  b: 7.6,  from: [.5, .42, 1.45], to: [.5, .42, 2.05], grade: 'night', fx: ['dust'], fade: 1.2 },
    { img: 'dinner53', a: 7.6,  b: 13.6, from: [.30, .56, 1.40], to: [.42, .54, 1.18], grade: 'mem',   fx: ['candle', 'dust'], fade: .25 },
    { img: 'room',     a: 13.6, b: 18.2, from: [.30, .40, 1.45], to: [.70, .40, 1.45], grade: 'night', fx: ['rain', 'lamp'], fade: .8 },
    { img: 'board',    a: 18.2, b: 23.2, from: [.50, .50, 1.05], to: [.50, .40, 1.55], grade: 'warm',  fx: ['dust'], fade: .8 },
    // главы
    { img: 'watch',    a: 23.2, b: 27.6, from: [.32, .50, 1.25], to: [.30, .49, 1.75], grade: 'mem',   fx: ['candle'], fade: .2 },
    { img: 'darkroom', a: 27.6, b: 31.8, from: [.50, .48, 1.20], to: [.55, .30, 1.55], grade: 'red',   fx: ['dust'], fade: .2 },
    { img: 'office53', a: 31.8, b: 36.2, from: [.45, .50, 1.30], to: [.65, .48, 1.85], grade: 'mem',   fx: ['dust'], fade: .6 },
    { img: 'dorm31',   a: 36.2, b: 40.4, from: [.30, .60, 1.35], to: [.50, .46, 1.40], grade: 'mem',   fx: ['candle', 'dust'], fade: .2 },
    { img: 'tray',     a: 40.4, b: 44.6, from: [.50, .50, 1.15], to: [.446, .60, 2.10], grade: 'warm', fx: ['dust'], fade: .6 },
    { img: 'dinner75', a: 44.6, b: 49.0, from: [.50, .52, 1.10], to: [.50, .46, 1.50], grade: 'warm',  fx: ['candle', 'dust'], fade: .2 },
    { img: 'cellar53', a: 49.0, b: 53.6, from: [.40, .52, 1.30], to: [.54, .30, 1.70], grade: 'mem',   fx: ['candle'], fade: .6 },
    // монтаж
    { img: 'rookwall', a: 53.6, b: 54.4, from: [.50, .50, 1.10], to: [.50, .50, 1.25], grade: 'warm', fx: [], fade: .05 },
    { img: 'kitchen',  a: 54.4, b: 55.2, from: [.62, .50, 1.30], to: [.62, .48, 1.45], grade: 'warm', fx: [], fade: .05 },
    { img: 'office75', a: 55.2, b: 56.0, from: [.72, .45, 1.40], to: [.72, .45, 1.60], grade: 'night', fx: ['rain'], fade: .05 },
    { img: 'dorm75',   a: 56.0, b: 56.8, from: [.50, .30, 1.60], to: [.50, .30, 1.90], grade: 'night', fx: ['rain'], fade: .05 },
    { img: 'board',    a: 56.8, b: 57.6, from: [.50, .50, 1.30], to: [.50, .50, 1.10], grade: 'warm', fx: [], fade: .05 },
    { img: 'dinner53', a: 57.6, b: 58.4, from: [.39, .60, 1.80], to: [.39, .60, 2.20], grade: 'mem',  fx: ['candle'], fade: .05 },
    { img: 'cellar53', a: 58.4, b: 59.6, from: [.54, .30, 1.90], to: [.54, .30, 2.40], grade: 'mem',  fx: ['candle'], fade: .05 }
  ],
  texts: [
    { a: 1.6,  b: 4.2,  style: 'line', text: '14 ноября 1953 года.' },
    { a: 4.4,  b: 7.3,  style: 'line', text: 'Без двадцати десять.' },
    { a: 8.4,  b: 13.2, style: 'line', text: 'Моя мать упала лицом в скатерть — и больше не поднялась.' },
    { a: 14.2, b: 16.4, style: 'line', text: 'Полиция сказала: сердце.' },
    { a: 16.6, b: 18.0, style: 'line', text: 'Я не поверила.' },
    { a: 18.8, b: 22.9, style: 'line', text: 'Двадцать два года спустя я тяну за красную нить.' },
    { a: 23.4, b: 26.6, style: 'card', label: 'Глава I',   text: 'Ужин у Пикмана' },
    { a: 27.8, b: 30.9, style: 'card', label: 'Глава II',  text: 'Тёмная комната' },
    { a: 32.6, b: 35.8, style: 'line', text: 'Фотограф, у которого нет лица.' },
    { a: 36.4, b: 39.5, style: 'card', label: 'Глава III', text: 'Приют святой Агнессы' },
    { a: 41.2, b: 44.2, style: 'line', text: 'Перстень с вороном. Номер девять.' },
    { a: 44.8, b: 47.9, style: 'card', label: 'Глава IV',  text: 'Ужин у Пикмана. Снова' },
    { a: 49.6, b: 53.2, style: 'line', text: 'Тот же стол. Те же гости. Двадцать два года спустя.' },
    { a: 53.8, b: 56.6, style: 'big',  text: 'Каждая улика — нить' },
    { a: 56.8, b: 59.5, style: 'big',  text: 'Каждая нить ведёт к правде' },
    { a: 64.4, b: 69.4, style: 'hand', text: '«Ты смотришь не туда, Ада»' }
  ],
  logo: { a: 61.2, b: 71.2 },
  crow: { a: 59.8, b: 61.6 },
  flashes: [7.6, 23.2, 27.6, 36.2, 44.6, 53.6, 55.2, 56.8, 58.4, 59.6],
  lightning: [7.6, 15.8, 55.2],
  // звук
  music: { start: 8.0, beat: 0.42, loops: 3 },
  thunder: [7.7, 15.9, 53.7],
  camera: [23.2, 27.6, 36.2, 44.6],
  whoosh: [59.6],
  caw: [60.2],
  boom: [61.2],
  ticks: [1.5, 2.5, 3.5, 4.5, 5.5, 6.5]
};
if (typeof module !== 'undefined') module.exports = TIMELINE;

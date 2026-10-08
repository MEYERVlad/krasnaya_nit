# «Красная нить» для Steam

Настольная версия игры на Electron. Игра остаётся одним файлом `../index.html`. Перед сборкой скрипт копирует его в `app/` и подключает шрифты из `fonts/` вместо Google Fonts, поэтому интернет игре не нужен.

```
steam/
  main.js, preload.js    окно игры: полный экран, F11 / Alt+Enter, кнопки «Во весь экран» и «Выйти» в меню
  scripts/prepare.mjs     index.html → app/ с локальными шрифтами
  scripts/icons.mjs       значок: build/icon.png (1024), build/icon.ico
  scripts/store-assets.mjs  скриншоты и обложки для страницы магазина → store/
  fonts/                  шрифты Cormorant, Marck Script, Old Standard TT (лицензия SIL OFL, файлы OFL-*.txt)
  steamworks/             конфиги для загрузки сборок через steamcmd
  store/                  готовые картинки для страницы в Steam
```

## 1. Собрать игру

Нужен Node.js 22. Windows-сборку лучше делать на Windows, macOS — только на Mac.

```
cd steam
npm install
npm start            # запустить игру в окне для проверки
npm run dist:win     # → dist/win-unpacked/KrasnayaNit.exe
npm run dist:linux   # → dist/linux-unpacked/krasnaya-nit
npm run dist:mac     # → dist/mac-universal/Krasnaya Nit.app (только на macOS)
```

После любых правок в `index.html` сборку нужно повторить: `prepare-app` берёт свежую копию игры.

Сохранения лежат в профиле пользователя:
- Windows: `%APPDATA%\Krasnaya Nit\Local Storage\`
- Linux: `~/.config/Krasnaya Nit/Local Storage/`
- macOS: `~/Library/Application Support/Krasnaya Nit/Local Storage/`

## 2. Завести игру в Steamworks

1. Зарегистрироваться в Steamworks (partner.steamgames.com), подписать соглашение, заполнить налоговые и банковские данные.
2. Оплатить Steam Direct — 100 $ за игру. Деньги вернутся, когда игра заработает 1000 $.
3. Получить AppID. Steam сам создаст депо: обычно AppID+1, AppID+2 и т. д.

## 3. Загрузить сборку

1. Скачать Steamworks SDK, в нём лежит `tools/ContentBuilder/builder/steamcmd`.
2. В `steamworks/app_build.vdf` и `depot_*.vdf` заменить `APP_ID`, `WIN_DEPOT_ID`, `LINUX_DEPOT_ID` на свои номера.
3. Собрать игру (раздел 1), затем выполнить:
   ```
   steamcmd +login ВАШ_ЛОГИН +run_app_build /полный/путь/к/steam/steamworks/app_build.vdf +quit
   ```
4. В Steamworks → **Installation → General Installation** добавить параметры запуска:
   - Windows: исполняемый файл `KrasnayaNit.exe`
   - Linux: исполняемый файл `krasnaya-nit`
5. В **SteamPipe → Builds** выбрать загруженную сборку и выставить её на ветку `default`.

## 4. Облачные сохранения (Steam Cloud, по желанию)

Steamworks → **Steam Cloud** → включить, квота 10 МБ, затем **Auto-Cloud → Root Paths**:

| ОС | Root | Подкаталог | Шаблон |
|---|---|---|---|
| Windows | WinAppDataRoaming | `Krasnaya Nit/Local Storage` | `*`, рекурсивно |
| Linux | LinuxXdgConfigHome | `Krasnaya Nit/Local Storage` | `*`, рекурсивно |

## 5. Страница в магазине

Картинки лежат в `store/`, их можно перегенерировать: `npm run store-assets` (нужен Playwright).

| Поле в Steamworks | Файл |
|---|---|
| Header Capsule 920×430 | `header_capsule_920x430.png` |
| Small Capsule 462×174 | `small_capsule_462x174.png` |
| Main Capsule 1232×706 | `main_capsule_1232x706.png` |
| Vertical Capsule 748×896 | `vertical_capsule_748x896.png` |
| Library Capsule 600×900 | `library_capsule_600x900.png` |
| Library Hero 3840×1240 | `library_hero_3840x1240.png` |
| Library Logo 1280×720 | `library_logo_1280x720.png` |
| Page Background | `page_background_1438x810.png` |
| Screenshots 1920×1080 (минимум 5) | `screenshots/*.png` |
| Значок (Client Icon / Community Icon) | `../build/icon.png`, `../build/icon.ico` |

Steam требует ещё трейлер (рекомендуется, но не обязателен) и ответы в анкете о содержимом. В игре есть убийство, отравление и тема похищения детей. Отметьте это в Content Survey.

**Краткое описание** (до 300 знаков):

> Детективная point-and-click головоломка в духе Rusty Lake. В 1953 году на званом ужине умерла мать Ады. Спустя двадцать два года Ада распутывает красную нить: фотографии, воспоминания, приют святой Агнессы и ужин, который повторится.

**Полное описание** (черновик):

> 14 ноября 1953 года. Особняк мистера Пикмана. Без двадцати десять журналистка Элеонора Лэнг падает лицом в скатерть. Врач говорит: «сердце». Её семилетняя дочь видит всё из-под стола.
>
> 1975 год. Ада выросла. На её пробковой доске — лица гостей того вечера, соединённые красными нитями.
>
> • Четыре главы: особняк, редакция газеты с фотолабораторией, заброшенный приют, повторный ужин.
> • Входите в старые фотографии и меняйте прошлое изнутри воспоминаний.
> • Проявляйте плёнку при красном свете, подбирайте шифры, раскладывайте улики и предъявляйте их подозреваемым.
> • Рисованная графика, дождь, вальс из музыкальной шкатулки — и ворон, который знает больше, чем говорит.

Метки: Point & Click, Puzzle, Detective, Mystery, Hidden Object, Psychological, Atmospheric, 2D, Story Rich, Singleplayer.

**Системные требования** (минимум): Windows 10 64-bit, 4 ГБ ОЗУ, любая видеокарта с поддержкой DirectX 11, 600 МБ на диске.

Язык интерфейса и текста — русский. В Steamworks → **Languages** отметьте только русский (интерфейс + субтитры). Перевод на английский заметно расширит аудиторию.

## 6. Перед релизом

- Страница «Скоро выйдет» должна висеть минимум 2 недели до релиза.
- Steam проверяет и страницу, и сборку, обычно 3–5 рабочих дней на каждую.
- Пройдите игру из установленной через Steam сборки: свежий старт, все 4 главы, выход и повторный запуск с сохранением.

## Что можно добавить позже

- Достижения Steam: по одному за каждую главу (через библиотеку `steamworks.js`).
- Оверлей Steam в Electron работает нестабильно. Если он нужен, в `main.js` можно добавить флаги `in-process-gpu` и `disable-direct-composition` и проверить на Windows.
- Подпись exe сертификатом разработчика, чтобы Windows SmartScreen не ругался при запуске вне Steam.

import { capture } from '../src';

// // Capture specific window
// const window = await findWindow('Chrome');
// if (window) {
//   await capture({ window: { title: window.title } });
// }

// // List displays and capture specific monitor
// const displays = await listDisplays();
// if (displays.length > 1) {
//   await capture({ region: displays[1].bounds });
// }

// Capture to clipboard with cursor and delay
capture({
  clipboard: true,
  cursor: true
  // format: 'png',
  // delay: 5,
  // window: { interactive: true }
})
  .then(result => console.log(result))
  .catch(error => console.error(error));

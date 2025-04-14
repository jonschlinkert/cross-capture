import { capture } from '../src';

capture({
  // cursor: false,
  // format: 'png',
  // region: { x: 0, y: 0, width: 100, height: 100 },
  // window: { interactive: true },
  interactive: true
})
  .then(result => console.log(result))
  .catch(error => console.error(error));


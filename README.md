# React Router v7 + Emotion v12 + Vite

## Getting started

```bash
npm install && npm run dev
```

Open the browser devtools, you will see the hydration error and the critical css is not applied.

## Fix the hydration error

To make the SSR works with critical css, update the path in `node_modules`:

- Open `node_modules/@emotion/react/dist/emotion-react.cjs.js`
- Replace the production file `emotion-element-*.cjs.js` with the development file `emotion-element-*.development.cjs.js`

  ```diff
  - var emotionElement = require('./emotion-element-a1829a1e.cjs.js');
  + var emotionElement = require('./emotion-element-e8f4cc37.development.cjs.js');
  ```

- Rerun the dev server and check the browser devtools, the hydration error is fixed and the critical css is applied.

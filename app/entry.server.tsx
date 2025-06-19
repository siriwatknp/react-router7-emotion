import { Transform } from "node:stream";

import type { AppLoadContext, EntryContext } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { CacheProvider as EmotionCacheProvider } from "@emotion/react";
import createEmotionServer from "@emotion/server/create-instance";
import createCache from "@emotion/cache";

const ABORT_DELAY = 5000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadContext: AppLoadContext
) {
  const emotionCache = createCache({
    key: "mui",
  });
  const { extractCriticalToChunks, constructStyleTagsFromChunks } =
    createEmotionServer(emotionCache);

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const userAgent = request.headers.get("user-agent");
    const readyOption =
      (userAgent && isbot(userAgent)) || routerContext.isSpaMode
        ? "onAllReady"
        : "onShellReady";

    const { pipe, abort } = renderToPipeableStream(
      <EmotionCacheProvider value={emotionCache}>
        <ServerRouter context={routerContext} url={request.url} />
      </EmotionCacheProvider>,
      {
        [readyOption]() {
          shellRendered = true;

          // Collect the HTML chunks
          const chunks: Buffer[] = [];

          // Create transform stream to collect HTML and inject styles
          const transformStream = new Transform({
            transform(chunk, _encoding, callback) {
              // Collect chunks, don't pass them through yet
              chunks.push(chunk);
              callback();
            },
            flush(callback) {
              // Combine all chunks into HTML string
              const html = Buffer.concat(chunks).toString();

              // Extract emotion styles from the collected HTML
              const emotionChunks = extractCriticalToChunks(html);
              const styles = constructStyleTagsFromChunks(emotionChunks);

              // Find where to inject styles (after emotion-insertion-point)
              if (
                styles &&
                html.includes('<meta name="emotion-insertion-point"')
              ) {
                const injectedHtml = html.replace(
                  '<meta name="emotion-insertion-point" content=""/>',
                  `<meta name="emotion-insertion-point" content=""/>${styles}`
                );
                // Write the modified HTML
                this.push(injectedHtml);
              } else {
                // No modification needed, write original HTML
                this.push(html);
              }

              callback();
            },
          });

          const stream = createReadableStreamFromReadable(transformStream);

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          pipe(transformStream);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

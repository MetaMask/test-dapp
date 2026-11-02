const fs = require('fs');
const http = require('http');
const path = require('path');

const fsPromises = fs.promises;
const artifactDirectory = path.resolve(process.argv[2] || 'dist');
const requestTimeout = 5000;
const testTimeout = 30000;
let activeServer;

const contentTypes = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
};

function fail(message) {
  throw new Error(message);
}

async function createServer() {
  const artifacts = new Map();

  // Only filesystem-discovered files may be served. Never follow symlinks or
  // construct filesystem paths from incoming request URLs.
  async function loadArtifacts(directory, urlPrefix) {
    const entries = await fsPromises.readdir(directory, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const filePath = path.join(directory, entry.name);
      const urlPath = `${urlPrefix}/${entry.name}`;

      if (entry.isDirectory()) {
        await loadArtifacts(filePath, urlPath);
      } else if (entry.isFile()) {
        artifacts.set(urlPath, {
          body: await fsPromises.readFile(filePath),
          contentType:
            contentTypes[path.extname(entry.name)] ||
            'application/octet-stream',
        });
      }
    }
  }

  await loadArtifacts(artifactDirectory, '');

  return http.createServer((incomingRequest, response) => {
    let urlPath;

    try {
      urlPath = decodeURIComponent(incomingRequest.url.split('?')[0]);
    } catch {
      response.writeHead(400);
      response.end();
      return;
    }

    const artifact = artifacts.get(urlPath === '/' ? '/index.html' : urlPath);

    if (!artifact) {
      response.writeHead(404);
      response.end();
      return;
    }

    response.writeHead(200, { 'Content-Type': artifact.contentType });
    response.end(artifact.body);
  });
}

function request(serverUrl, urlPath) {
  return new Promise((resolve, reject) => {
    const clientRequest = http.get(`${serverUrl}${urlPath}`, (response) => {
      const chunks = [];

      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        resolve({
          body: Buffer.concat(chunks),
          contentType: response.headers['content-type'] || '',
          statusCode: response.statusCode,
        });
      });
    });

    clientRequest.setTimeout(requestTimeout, () => {
      clientRequest.destroy(new Error(`Request timed out: ${urlPath}`));
    });
    clientRequest.on('error', reject);
  });
}

function localReferences(html) {
  const references = new Set();
  const referencePattern = /(?:src|href)="([^"]+)"/gu;
  let match;

  while ((match = referencePattern.exec(html))) {
    const reference = match[1];
    if (!/^(?:[a-z]+:|\/\/|#|data:)/iu.test(reference)) {
      references.add(new URL(reference, 'http://localhost/').pathname);
    }
  }

  return references;
}

async function runSmokeTest() {
  try {
    if (!(await fsPromises.stat(artifactDirectory)).isDirectory()) {
      fail(`Artifact path is not a directory: ${artifactDirectory}`);
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      fail(`Artifact directory does not exist: ${artifactDirectory}`);
    }
    throw error;
  }

  const server = await createServer();
  activeServer = server;

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  const serverUrl = `http://127.0.0.1:${address.port}`;

  try {
    const pages = [
      { path: '/', title: 'E2E Test Dapp', script: 'main.js' },
      {
        path: '/request.html',
        title: 'E2E Test Dapp - Send Individual Request',
        script: 'request.js',
      },
    ];
    const references = new Set(['/constants.json']);

    for (const page of pages) {
      const response = await request(serverUrl, page.path);
      const html = response.body.toString();

      if (
        response.statusCode !== 200 ||
        !response.contentType.startsWith('text/html')
      ) {
        fail(`Expected HTML page at ${page.path}`);
      }
      if (!html.includes(`<title>${page.title}</title>`)) {
        fail(`Unexpected title at ${page.path}`);
      }
      if (!html.includes(`src="${page.script}"`)) {
        fail(`Expected script ${page.script} in ${page.path}`);
      }

      for (const reference of localReferences(html)) {
        references.add(reference);
      }
    }

    for (const reference of references) {
      const response = await request(serverUrl, reference);
      if (response.statusCode !== 200 || response.body.length === 0) {
        fail(`Expected a non-empty local asset at ${reference}`);
      }

      const extension = path.extname(reference);
      const expectedContentType = contentTypes[extension];
      if (
        expectedContentType &&
        !response.contentType.startsWith(expectedContentType)
      ) {
        fail(
          `Unexpected content type for ${reference}: ${response.contentType}`,
        );
      }
    }

    const constants = await request(serverUrl, '/constants.json');
    JSON.parse(constants.body.toString());

    const missingRoute = await request(serverUrl, '/does-not-exist');
    if (missingRoute.statusCode !== 404) {
      fail(
        `Expected unknown route to return 404, got ${missingRoute.statusCode}`,
      );
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
    activeServer = undefined;
  }
}

const timeout = new Promise((_, reject) => {
  const timer = setTimeout(() => {
    if (activeServer) {
      activeServer.closeAllConnections();
      activeServer.close();
    }
    reject(new Error('Smoke test timed out'));
  }, testTimeout);
  timer.unref();
});

Promise.race([runSmokeTest(), timeout])
  .then(() => {
    console.log(`Production artifact smoke test passed: ${artifactDirectory}`);
  })
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });

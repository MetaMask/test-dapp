/**
 * Get the `main` section of the page, ensuring that it is the only
 * one present.
 */
function getMainElement() {
  const mainElements = document.getElementsByTagName('main');

  if (mainElements.length === 0) {
    throw new Error('Main element not found');
  } else if (mainElements.length > 1) {
    throw new Error('Multiple main elements found');
  }
  return mainElements[0];
}

/**
 * Get request data from the query string.
 *
 * @returns {object} The request data.
 */
function getRequestData() {
  const queryString = window.location.search;

  if (queryString.length === 0) {
    throw new Error('Request invalid: query string empty');
  }

  const searchParams = new URLSearchParams(queryString);
  const method = searchParams.get('method');

  if (method === null) {
    throw new Error('Request invalid: method not provided in query string');
  }

  const rawParams = searchParams.get('params');

  let params;
  if (rawParams !== null) {
    try {
      params = JSON.parse(rawParams);
    } catch (error) {
      throw new Error('Request invalid: failed to parse params', {
        cause: error,
      });
    }

    if (params === null) {
      throw new Error(`Request invalid: params parsed as null`);
    } else if (typeof params !== 'object') {
      throw new Error(
        `Request invalid: params parsed as type '${typeof params}'`,
      );
    }
  }

  const request = { method };
  if (params) {
    request.params = params;
  }
  return request;
}

/**
 * Run the request encoded in the query parameters.
 */
async function main() {
  const mainElement = getMainElement();

  /**
   * Log a message, and set it on the page.
   *
   * @param {string} message - The message to log and set on the page.
   */
  function logAndSet(message) {
    console.log(message);
    mainElement.innerText = message;
  }

  try {
    if (!window.ethereum) {
      throw new Error('Provider not found');
    }

    const requestData = getRequestData();

    logAndSet(`Sending request: ${JSON.stringify(requestData)}`);

    const result = await window.ethereum.request(requestData);

    logAndSet(`Response: ${JSON.stringify(result)}`);
  } catch (error) {
    mainElement.innerText = error.message || 'Unknown error';
    throw error;
  }
}

main().catch(console.error);

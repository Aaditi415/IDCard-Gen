
const inFlightRequests = new Map();

export function getSharedRequest(url, options = {}) {
    const headers = options.headers || {};
    const authorization = headers.Authorization || "";

    // Keep requests from different authenticated sessions separate.
    const key = `${url}::${authorization}`;

    if (inFlightRequests.has(key)) {
        return inFlightRequests.get(key);
    }

    const request = fetch(url, options).finally(() => {
        inFlightRequests.delete(key);
    });

    inFlightRequests.set(key, request);

    return request;
}

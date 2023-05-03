export interface HttpResponse<T> extends Response {
    parsedBody?: T;
}

export async function http<T>(request: RequestInfo): Promise<HttpResponse<T>> {
    const resp: HttpResponse<T> = await fetch(request);

    try {
        // may error if there is no body
        resp.parsedBody = await resp.json();
    } catch (ex) {
    }

    if (!resp.ok) {
        throw new Error(resp.statusText);
    }

    return resp;
}

export async function get<T>(path: string,
                             args: RequestInit = {
                                 method: "get"
                             }): Promise<HttpResponse<T>> {
    return await http<T>(new Request(path, args));
}

export async function putJSON<T>(path: string, body: any,
                                 args: RequestInit = {
                                     method: "put",
                                     body: JSON.stringify(body),
                                     headers: {
                                         "Content-Type": "application/json"
                                     }
                                 }): Promise<HttpResponse<T>> {
    return await http<T>(new Request(path, args));
}

export async function postJSON<T>(path: string, body: any,
                                  args: RequestInit = {
                                      method: "post",
                                      body: JSON.stringify(body),
                                      headers: {
                                          "Content-Type": "application/json"
                                      }
                                  }): Promise<HttpResponse<T>> {
    return await http<T>(new Request(path, args));
}

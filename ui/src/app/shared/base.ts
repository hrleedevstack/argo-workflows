function baseUrl(): string {
    const base = document.querySelector('base');
    return base ? base.getAttribute('href') : '/';
}

export function uiUrl(uiPath: string): string {
    return baseUrl() + uiPath;
}

export function uiUrlWithParams(uiPath: string, params: string[]): string {
    if (!params) {
        return uiUrl(uiPath);
    }
    return baseUrl() + uiPath + '?' + params.join('&');
}

export function apiUrl(apiPath: string): string {
    return `${baseUrl()}${apiPath}`;
}

export function keycloakUrl(apiPath: string): string {
    const base = 'https://keycloak.hrleedevstack.ml:32364/auth';
    return `${base}${apiPath}`;
}
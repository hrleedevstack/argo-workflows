import {Observable, Observer} from 'rxjs';
import * as _superagent from 'superagent';
import {SuperAgentRequest} from 'superagent';
import {apiUrl,keycloakUrl, uiUrlWithParams} from '../base';

const superagentPromise = require('superagent-promise');

const auth = (req: SuperAgentRequest) => {
    return req.on('error', handle);
};

const handle = (err: any) => {
    // check URL to prevent redirect loop
    if (err.status === 401 && !document.location.href.includes('login')) {
        document.location.href = uiUrlWithParams('login', ['redirect=' + document.location.href]);
    }
};

const superagent: _superagent.SuperAgentStatic = superagentPromise(_superagent, global.Promise);

export default {
    get(url: string) {
        return auth(superagent.get(apiUrl(url)));
    },

    post(url: string) {
        return auth(superagent.post(apiUrl(url)));
    },

    put(url: string) {
        return auth(superagent.put(apiUrl(url)));
    },

    patch(url: string) {
        return auth(superagent.patch(apiUrl(url)));
    },

    delete(url: string) {
        return auth(superagent.del(apiUrl(url)));
    },
    logout(){
        superagent.post(keycloakUrl('/realms/argo/protocol/openid-connect/token'))
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send("grant_type=client_credentials")
        .send("client_id=argoworkflow")
        .send("client_secret=gE9avSRpz3GZsSWqxPcUWxI6wqBNPyaT")
        .then((res) =>{
            console.log(res.body.access_token);
            superagent.post(keycloakUrl('/admin/realms/argo/logout-all'))
            .set('Content-Type', 'application/json')
            .set('Authorization', 'bearer '+res.body.access_token)
            .then((res) => {
                console.log(res);
            });
        });
    },
    loadEventSource(url: string): Observable<string> {
        return new Observable((observer: Observer<any>) => {
            const eventSource = new EventSource(url);
            // an null event is the best way I could find to get an event whenever we open the event source
            // otherwise, you'd have to wait for your first message (which maybe some time)
            eventSource.onopen = () => observer.next(null);
            eventSource.onmessage = x => observer.next(x.data);
            eventSource.onerror = x => {
                switch (eventSource.readyState) {
                    case EventSource.CONNECTING:
                        observer.error(new Error('Failed to connect to ' + url));
                        break;
                    case EventSource.OPEN:
                        observer.error(new Error('Error in open connection to ' + url));
                        break;
                    case EventSource.CLOSED:
                        observer.error(new Error('Connection closed to ' + url));
                        break;
                    default:
                        observer.error(new Error('Unknown error with ' + url));
                }
            };

            return () => {
                eventSource.close();
            };
        });
    }
};

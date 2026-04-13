import moment from 'moment';
import { ApiName, endpoint } from '@/Config';
import Cookies from 'universal-cookie';
import { clearStoredUser, googleSignIn } from '@/auth/AuthUtil';

const cookies = new Cookies();

export function cid() {

  let ts = moment().format('YYYYMMDDHHmmssSSS');

  let random = (Math.random() * 100000).toFixed(0).padStart(5, '0');

  return ts + '-' + random;

}

/**
 * Wrapper for the fetch() React method that adds the required fields for Toto authentication
 * @param noHeaderOverride set to true to avoid that this method overrides some of the headers
 */
export class TotoAPI {

  async fetch(api: ApiName, path: string, options?: any, noHeaderOverride: boolean = false) {

    if (options == null) options = { method: 'GET', headers: {} };
    if (options.headers == null) options.headers = {};

    let idToken = cookies.get('user') ? cookies.get('user').idToken : null

    // Adding standard headers
    if (!noHeaderOverride) {
      options.headers['Accept'] = 'application/json';
      options.headers['x-correlation-id'] = cid();
      options.headers['x-client'] = "totoMoneyWeb";
      options.headers['Authorization'] = 'Bearer ' + idToken;
      options.headers['auth-provider'] = "toto";
    }

    const response = await fetch(endpoint(api) + path, options);

    // If the backend returns an auth failure, clear stored credentials and trigger sign-in
    if (response.status === 401 || response.status === 403) {
      console.log(`Auth failure (${response.status}) from ${api}${path}. Clearing stored credentials.`);
      clearStoredUser();
      if (!TotoAPI._signingIn) {
        TotoAPI._signingIn = true;
        googleSignIn();
      }
    }

    return response;
  }

  // Tracks whether a sign-in flow is already in progress to prevent duplicate attempts
  static _signingIn = false;
}

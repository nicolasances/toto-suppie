import Cookies from "universal-cookie";
import { AuthAPI } from "../api/AuthAPI";
import { jwtDecode } from "jwt-decode";
// import jwt, { JsonWebTokenError } from "jsonwebtoken";

const cookies = new Cookies()
const googleClientID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

interface AuthenticatedUser {

    name: string,
    email: string,
    idToken: string

}

/**
 * Checks if the user token is stored in the local storage and 
 * returns the user if it is. 
 * 
 * Additionally adds the user in the cookies
 * 
 * @returns the user info, if the token was stored in the local storage
 */
export function getStoredUserToken() {

    // const user = cookies.get("user");
    const user = window.localStorage.getItem("user");

    console.log(`User found on local storage? [${user != null}]`);

    if (user) {
        cookies.set('user', JSON.parse(user), { path: '/' });
        console.log(`User: ${user}`);

        return JSON.parse(user);
    }

    return user;
}

/**
 * Retrieves a Toto Token, by providing a Google Token
 * 
 * @param googleToken the Google id token
 * 
 * @returns the Toto Token
 */
export async function getTotoToken(googleToken: string): Promise<any> {

    return await new AuthAPI().getTotoToken(googleToken);

}

/**
 * Retrieves a user object from the Toto Token
 * 
 * @param totoToken the Toto Token
 * @returns the user
 */
export function userFromToken(totoToken: string): AuthenticatedUser | null {

    const decodedToken = jwtDecode(totoToken) as any;

    console.log("Decoded Token: ");
    console.log(decodedToken);

    if (!decodedToken) return null;

    return {
        name: decodedToken.user,
        email: decodedToken.user,
        idToken: totoToken
    }
}

/**
 * Stores the user in cookies and local storage
 * 
 * @param user the user to store
 */
export function storeUser(user: AuthenticatedUser) {

    // Set the cookies
    cookies.set('user', user, { path: '/' });

    // Save the user in local storage
    window.localStorage.setItem("user", JSON.stringify(user));

}

/**
 * Sign-in using Google
 */
export function googleSignIn() {

    if ((window as any).google) {

        console.log("Google API loaded!");
        console.log("Initializing Google with Client ID " + googleClientID);

        (window as any).google.accounts.id.initialize({

            client_id: googleClientID,
            auto_select: true,

            callback: (auth: any) => {

                console.log("Received auth response from Google SignIn");

                if (auth.credential) {

                    console.log("Google Sign-in Successfull!");

                    getTotoToken(auth.credential).then((totoToken) => {

                        const user = userFromToken(totoToken.token);

                        if (!user) {
                            console.log(`No user was extracted from token [${JSON.stringify(totoToken)}]`);
                            return;
                        }

                        console.log(`User extracted from token: [${JSON.stringify(user)}]`);

                        // Store the user
                        storeUser(user);

                    }, (error) => {
                        console.log(error);
                    })

                }
            }
        });

        (window as any).google.accounts.id.prompt();
    }
    else {
        console.log("Google API not loaded... waiting..");
        setTimeout(googleSignIn, 50);
    }

}
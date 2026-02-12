export type ApiName = 'supermarket' | 'auth'
export interface ApiEndpoint { name: ApiName, endpoint: string }

const ApiEndpoints = new Map<ApiName, string>();
ApiEndpoints.set("auth", String(process.env.NEXT_PUBLIC_AUTH_API_ENDPOINT))
ApiEndpoints.set("supermarket", String(process.env.NEXT_PUBLIC_SUPERMARKET_API_ENDPOINT))

export function endpoint(api: ApiName) {
    return ApiEndpoints.get(api)
}

export const APP_VERSION = "1.0.0"
export const GOOGLE_CLIENT_ID = String(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)

/**
 * Health check endpoint, used by the GKE readiness and liveness probes and by the load balancer health check (HealthCheckPolicy).
 *
 * - It is public: no authentication is required.
 * - It always responds with HTTP 200 as long as the Next.js server is up.
 *
 * @returns {Response} HTTP 200 with the JSON body { status: "ok" }
 */
export async function GET(): Promise<Response> {

    return Response.json({ status: 'ok' });
}

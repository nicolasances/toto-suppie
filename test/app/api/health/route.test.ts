import assert from 'node:assert/strict';
import { GET } from '../../../../app/api/health/route';

describe('GET /api/health', () => {

    it('responds with HTTP 200, so that GKE probes and the load balancer health check consider the pod healthy', async () => {

        const response = await GET();

        assert.equal(response.status, 200);
    });

    it('responds with a JSON body { status: "ok" }', async () => {

        const response = await GET();

        const body = await response.json();

        assert.deepEqual(body, { status: 'ok' });
    });
});

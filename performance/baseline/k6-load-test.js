import http from 'k6/http';
import { check, sleep } from 'k6';

// The number of VUs can be passed via command line: -e VUS=50 --vus 50 --duration 10s
const TARGET_VUS = parseInt(__ENV.VUS || '10');
const DURATION = __ENV.DURATION || '15s';

export const options = {
  vus: TARGET_VUS,
  duration: DURATION,
  thresholds: {
    http_req_failed: ['rate<0.05'], // error rate should be < 5%
    http_req_duration: ['p(95)<3000'], // 95% of requests should be < 3s
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export function setup() {
  // Login once to get session cookie
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      email: 'benchmark@gpms.io',
      password: 'Password123!',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  check(loginRes, {
    'setup login successful': (r) => r.status === 200,
  });

  const cookies = loginRes.cookies;
  const sessionCookie = cookies['connect.sid'] ? `connect.sid=${cookies['connect.sid'][0].value}` : '';

  // Get workspace ID
  const wsRes = http.get(`${BASE_URL}/api/workspace/all`, {
    headers: { Cookie: sessionCookie },
  });
  const wsJson = wsRes.json();
  const workspaceId = wsJson.workspaces && wsJson.workspaces.length > 0 ? wsJson.workspaces[0]._id : '';

  // Get project ID
  let projectId = '';
  if (workspaceId) {
    const projRes = http.get(`${BASE_URL}/api/project/workspace/${workspaceId}/all`, {
      headers: { Cookie: sessionCookie },
    });
    const projJson = projRes.json();
    if (projJson.projects && projJson.projects.length > 0) {
      projectId = projJson.projects[0]._id;
    }
  }

  return { sessionCookie, workspaceId, projectId };
}

export default function (data) {
  const { sessionCookie, workspaceId, projectId } = data;
  const headers = { Cookie: sessionCookie };

  // 1. Browse workspace
  if (workspaceId) {
    const resWs = http.get(`${BASE_URL}/api/workspace/${workspaceId}`, { headers });
    check(resWs, {
      'workspace details 200': (r) => r.status === 200,
    });
  }

  // 2. Fetch task list (Page 1, 10 items)
  if (workspaceId) {
    const resTasks = http.get(`${BASE_URL}/api/task/workspace/${workspaceId}/all?pageNumber=1&pageSize=10`, { headers });
    check(resTasks, {
      'task list 200': (r) => r.status === 200,
    });
  }

  // 3. Fetch workspace analytics
  if (workspaceId) {
    const resAnalytics = http.get(`${BASE_URL}/api/workspace/analytics/${workspaceId}`, { headers });
    check(resAnalytics, {
      'workspace analytics 200': (r) => r.status === 200,
    });
  }

  // 4. Fetch project analytics ($facet)
  if (workspaceId && projectId) {
    const resProjAnalytics = http.get(`${BASE_URL}/api/project/${projectId}/workspace/${workspaceId}/analytics`, { headers });
    check(resProjAnalytics, {
      'project analytics 200': (r) => r.status === 200,
    });
  }

  sleep(0.5);
}

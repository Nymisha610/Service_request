# Submission

**Candidate:** Srirangam Sai Nymisha  **Date:** 12 October 2026  **Time spent:** 28 hours and 45 minutes.

- Repository: https://github.com/Nymisha610/Service_request 
- Deployed frontend URL (HTTPS): https://service-request-orcin.vercel.app/ 
- Deployed API URL (HTTPS): https://service-request-api-cp57.onrender.com/ 

## Bug reports

Bug 1: Request list reads the wrong response property 
Symptom: The dashboard showed an empty request list even though the API was reachable. 
Steps to reproduce: 1. Start the backend and frontend. 2. Open the dashboard. 3. Observe the Requests panel while the API status is online. 
Evidence: Initial dashboard screenshot shows API online but 0 requests. The code-diff screenshot shows the response property change. 
Root cause: frontend/src/api/serviceRequests.js, fetchServiceRequests(): the frontend returned payload.requests, but the backend response used payload.data. The UI therefore read an undefined property instead of the returned list. 
Fix: Changed return payload.requests to return payload.data. Commit: [Add commit URL or hash]. 
How I verified it: After the fix, requests appeared in the localhost screenshot and in the deployed Vercel screenshot. 

Bug 2: Form submission sends the wrong field name 
Symptom: The form showed a validation error when submitting a request even though values had been entered. 
Steps to reproduce: 1. Open the dashboard. 2. Fill in the form. 3. Submit the request. 4. Observe the validation feedback and API response. 
Evidence: Initial dashboard screenshot shows the validation error. The code-diff screenshot shows message changed to description. 
Root cause: frontend/src/utils/payload.js: the payload mapper sent message: form.description.trim(), but the backend schema expected description. The request body did not match the backend contract. 
Fix: Changed the payload key from message to description. Commit: [Add commit URL or hash]. 
How I verified it: The deployed screenshot shows a successful submission confirmation. The backend was also reported to accept a request after the change.

Bug 3: Production API URL ignored environment configuration 
Symptom: A deployed frontend could send API requests to localhost instead of the hosted backend. 
Steps to reproduce: 1. Build/deploy the frontend. 2. Open the public site. 3. Check the API requests in the browser Network tab. 
Evidence: The code-diff screenshot shows the config.js change to prioritize VITE_API_BASE_URL. 
Root cause: frontend/src/config.js: API_BASE_URL was hardcoded to http://localhost:8000. In a visitor's browser, localhost points to that visitor's own device, not the Render backend. 
Fix: Updated API_BASE_URL to use import.meta.env.VITE_API_BASE_URL first, retaining the development/localhost fallback. Commit: [Add commit URL or hash]. 
How I verified it: The deployed screenshot shows API online and requests populated. For full repeatability, verify the Vercel variable is set to the Render API URL and inspect the live Network tab. 

Bug 4: Newly Submitted Requests Disappeared After Refresh

Symptom: Newly submitted service requests appeared in the dashboard immediately after submission but disappeared after refreshing the page, while the original sample requests remained visible.

Steps to Reproduce:
1. Open the Service Request Dashboard.
2. Submit a valid service request.
3. Verify that the request appears in the list and a success message is displayed.
4. Refresh the browser page.
5. Observe whether the newly submitted request remains in the list.

Evidence: The issue was reproduced during testing of the deployed application. The original sample requests remained visible, but newly submitted requests disappeared after a page refresh.

Root Cause: The backend's JSON-file storage implementation did not reliably preserve newly submitted requests. This affected the consistency of request data returned by the GET endpoint after refreshing the application.

Fix: Updated "storage.py" to use atomic JSON-file writes, reducing the risk of incomplete files during interrupted writes. Added backend tests to verify that newly submitted requests are returned by the GET endpoint and remain available after the file-backed store is recreated. Also added a root API route in "main.py" to display service status and links to the API routes. The changes were pushed in commit "c5bb89c".

How I Verified It: Verified that newly submitted requests remain visible after refreshing the page. All 10 backend tests passed, including tests for retrieving newly submitted requests and preserving them when the file-backed store is recreated. The updated backend changes must be deployed on Render for the fix to take effect in production.


## Test checklist

| # | Test | Desktop | Mobile | Result (pass/fail) | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | Page loads, list renders |Yes |Yes |Pass | |
| 2 | Submit a valid request → success message, list updates |Yes |Yes |Pass | |
| 3 | Submit invalid input → clear messages, nothing sent/stored | Yes| Yes|Pass | |
| 4 | API unavailable → error state, no blank page, no fake success |Yes |Yes |Pass ||
| 5 | Layout at ~375px and ~1280px wide |Yes|Yes |Pass | |
| 6 | Deployed site over HTTPS in a fresh/private browser session |Yes|Yes |Pass | |
| … | | | | | |

Evidence of the working site (screenshots or recording link): https://drive.google.com/file/d/1vYZIpkQ_jDSer3L-jz23lFwURl_HT0mq/view?usp=sharing

## Deployment notes
Hosting choices: frontend deployed on Vercel; backend/API deployed on Render. 
Frontend URL: https://service-request-orcin.vercel.app/ . Repository: https://github.com/Nymisha610/Service_request 
Environment configuration: set VITE_API_BASE_URL in Vercel to the public Render API base URL. Vite variables are applied at build time, so redeploy after changing the value. 
Connectivity: confirm the Render service is running and configured to allow requests from the deployed Vercel origin through CORS. 
Free-tier limitations: free-plan quotas, cold starts/sleep behavior, and availability depend on current Vercel and Render plan terms. No paid service was intentionally added. 
Rollback plan: redeploy the last known-good Vercel deployment and revert the relevant Git commit if a change causes a regression; keep frontend and backend versions compatible.

## What I would improve next

1. Database Integration: Integrate a database such as PostgreSQL to provide more reliable, long-term storage of service requests and support future scalability.

2. Automated Testing: Expand automated tests to cover form validation, successful request submission, data persistence, and API failure scenarios to ensure the application remains reliable after future changes.

3. Improved User Experience: Add features such as search, filtering, sorting, and status-based categorization to help users manage service requests more efficiently.

4. Security Enhancements: Introduce authentication and role-based access control if the application is extended for use by multiple users or administrators.

5. Deployment and Monitoring: Add application logging, health monitoring, and deployment checks to identify errors quickly and maintain reliable service availability.

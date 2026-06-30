# Auth-Gated App Testing Playbook (Emergent Google Auth)

## Quick Test User Setup

```bash
mongosh "$MONGO_URL" --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.photographers.insertOne({
  user_id: userId,
  email: 'test.photographer.' + Date.now() + '@example.com',
  name: 'Test Photographer',
  picture: 'https://via.placeholder.com/150',
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Test endpoints

```bash
API_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)

# /auth/me with Bearer token
curl -s -X GET "$API_URL/api/auth/me" -H "Authorization: Bearer $SESSION_TOKEN"

# /auth/logout
curl -s -X POST "$API_URL/api/auth/logout" -H "Authorization: Bearer $SESSION_TOKEN"
```

## Browser testing (Playwright)

```python
await page.context.add_cookies([{
    "name": "session_token",
    "value": "YOUR_SESSION_TOKEN",
    "domain": "ai-gallery-build.preview.emergentagent.com",
    "path": "/",
    "httpOnly": True,
    "secure": True,
    "sameSite": "None",
}])
await page.goto("https://ai-gallery-build.preview.emergentagent.com/studio")
# Should land on /studio with user pill visible
```

## Cleanup

```bash
mongosh "$MONGO_URL" --eval "
use('test_database');
db.photographers.deleteMany({email: /test\.photographer\./});
db.user_sessions.deleteMany({session_token: /test_session/});
"
```

## Checklist

- [ ] photographer document has `user_id` field (custom UUID)
- [ ] user_sessions doc has `user_id`, `session_token`, `expires_at` (tz-aware)
- [ ] All Mongo queries use `{"_id": 0}` projection
- [ ] `/api/auth/me` returns user data when cookie OR `Authorization: Bearer` is present
- [ ] `/studio` redirects unauthenticated visitors to `/login`
- [ ] After Google sign-in, user lands on `/studio` directly
- [ ] Logout clears cookie + DB session, redirects to `/`
- [ ] Public routes `/`, `/w/:slug` work without auth

## Allowed test accounts

(No fixed Google account — any Google login works; we create the user on first sign-in.)

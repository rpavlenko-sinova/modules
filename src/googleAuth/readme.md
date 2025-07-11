Here stored documentation to the google auth with

folder identity:
stores method utilizing chrome.identity

pros:

- easy to use
- Minimal management
- User stays logged in until revokes permissions through his google account

cons:

- extension only method
- User stays logged in no matter what. You can't revoke token on google side.
  In "Sentrama" project that was a problem, before switching to fetchAuthFlow method, because didn't allow comfortable swap of the google accounts

folder fetchAuthFlow:
stores method that utilizes fetch based auth flow.
authService.ts for websites, authServicePlasmo.ts for plasmo extensions.
All other files needed in both scenarios.

pros:

- more flexible than identity
- can revoke token
- can work in any web app

cons:

- manual token management
- manual data management

IMPORTANT!!! SCOPES SHOULD BE THE SAME EVERYWHERE. FROM MANIFEST TO EVERY SINGLE FUNCTION CALL.
OR YOU WILL GET WRONG TOKEN, AND AUTH WONT FUNCTION PROPERLY

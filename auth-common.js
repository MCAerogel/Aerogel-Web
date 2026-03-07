(function attachAerogelAuthCommon(global) {
  "use strict";

  var AUTH_SESSION_TOKEN_KEY = "aerogel_auth_session_token_v1";

  function getStoredAuthSessionToken() {
    try {
      return (localStorage.getItem(AUTH_SESSION_TOKEN_KEY) || "").trim();
    } catch (error) {
      console.error(error);
      return "";
    }
  }

  function setStoredAuthSessionToken(token) {
    try {
      if (token) {
        localStorage.setItem(AUTH_SESSION_TOKEN_KEY, String(token).trim());
      } else {
        localStorage.removeItem(AUTH_SESSION_TOKEN_KEY);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function buildAuthHeaders() {
    var token = getStoredAuthSessionToken();
    return token ? { Authorization: "Bearer " + token } : {};
  }

  function getAuthRedirectUrl(currentUrl) {
    var url = new URL(currentUrl || window.location.href);
    url.searchParams.delete("auth");
    url.searchParams.delete("auth_error");
    url.searchParams.delete("session");
    if (url.hash) {
      var hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
      hashParams.delete("auth");
      hashParams.delete("auth_error");
      hashParams.delete("session");
      url.hash = hashParams.toString();
    }
    return url.toString();
  }

  function consumeAuthSessionFromUrl(currentUrl) {
    var url = new URL(currentUrl || window.location.href);
    var searchAuthSession = (url.searchParams.get("session") || "").trim();
    var searchAuthError = (url.searchParams.get("auth_error") || "").trim();
    var searchHadAuthOk = url.searchParams.get("auth") === "ok";
    var hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
    var hashAuthSession = (hashParams.get("session") || "").trim();
    var hashAuthError = (hashParams.get("auth_error") || "").trim();
    var hashHadAuthOk = hashParams.get("auth") === "ok";
    var authSession = searchAuthSession || hashAuthSession;
    var authError = searchAuthError || hashAuthError;
    var hadAuthOk = searchHadAuthOk || hashHadAuthOk;
    var changed = false;

    if (authSession) {
      setStoredAuthSessionToken(authSession);
      url.searchParams.delete("session");
      changed = true;
    }
    if (hadAuthOk) {
      url.searchParams.delete("auth");
      hashParams.delete("auth");
      changed = true;
    }
    if (authError) {
      setStoredAuthSessionToken("");
      url.searchParams.delete("auth_error");
      hashParams.delete("auth_error");
      changed = true;
    }
    if (authSession) {
      hashParams.delete("session");
      changed = true;
    }
    url.hash = hashParams.toString();
    if (changed) {
      history.replaceState(null, "", url.toString());
    }

    return {
      hadAuthOk: hadAuthOk,
      hadAuthError: Boolean(authError),
      authErrorMessage: authError,
      hadSession: Boolean(authSession)
    };
  }

  global.AerogelAuthCommon = {
    getStoredAuthSessionToken: getStoredAuthSessionToken,
    setStoredAuthSessionToken: setStoredAuthSessionToken,
    buildAuthHeaders: buildAuthHeaders,
    getAuthRedirectUrl: getAuthRedirectUrl,
    consumeAuthSessionFromUrl: consumeAuthSessionFromUrl
  };
})(window);

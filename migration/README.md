# Migration to invitra-ai.netlify.app

The new production origin is `https://invitra-ai.netlify.app`.
The public brand remains Invitra, with Invatria retained as an alternate name.

## Main site

1. Commit and push the latest main-site source, then deploy that commit. The
   updated `netlify.toml` sets `NEXT_PUBLIC_SITE_URL` to the new origin. Check
   Netlify's environment settings for an older override and update it too.
2. Check the deployed homepage's canonical URL, `/robots.txt`, `/sitemap.xml`,
   About page, invitation share links and site identity schema. They must use
   `invitra-ai.netlify.app`, not `invatria.netlify.app` or localhost.
3. Add a URL-prefix Search Console property for
   `https://invitra-ai.netlify.app/`, complete its verification, then submit
   `https://invitra-ai.netlify.app/sitemap.xml`. The previous property does not
   automatically become the new one. Keep the existing Google verification file
   and use the exact file Google requests for the new property if it differs.
4. In Supabase Authentication URL Configuration, update the Site URL to the new
   origin and allow `https://invitra-ai.netlify.app/auth/callback` and
   `https://invitra-ai.netlify.app/auth/reset`. Update the guest Edge Functions'
   `ALLOWED_ORIGINS` to include `https://invitra-ai.netlify.app`. Retain any
   localhost origins still needed for development. These are hosted settings;
   changing this repository does not apply them remotely.
5. Test sign-in, password-reset emails, publishing, a shared invitation, RSVP
   and guest-book submission on the new domain. Browser login cookies for the
   previous hostname do not carry over to the new hostname.

## Old address

The live old hostname returned Netlify's site-not-found 404 after the rename.
A redirect inside the new app cannot handle requests that never reach that app.

If the old Netlify name remains available to your account, create a separate
static Netlify site named `invatria` and deploy only the contents of
`old-domain-redirects/` (or upload `old-domain-redirects.zip`). That package
preserves each old path through a permanent redirect to the same new path.
For example, `/templates/royal-gold` goes to
`https://invitra-ai.netlify.app/templates/royal-gold`; it does not send every
page to the homepage. Do not deploy this redirect package onto the NEW site:
that would redirect it to itself.

If you cannot reclaim or control the old hostname, contact Netlify about its
availability. This repository cannot restore ownership of a platform hostname.
After redirect hosting is active, check old root and nested URLs return a
301/308 and preserve their paths, then follow Google's site-move guidance for
Search Console's Change of Address where supported. Existing verification on
the old property should be retained.

Neither Netlify hosting changes, Search Console actions nor Supabase settings
have been applied by these files. The package is prepared for the owner to
deploy to the old hostname.

Reference: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes

/* Cloudflare Pages Function for every request.
   - zparkling.com (without www) sends visitors on to www.zparkling.com, path and #/?-parts included
   - keeps search engines out for now (X-Robots-Tag); remove NOINDEX when the site should be found */
const NOINDEX = true;
export async function onRequest(ctx) {
  const url = new URL(ctx.request.url);
  if (url.hostname === 'zparkling.com') {
    url.hostname = 'www.zparkling.com';
    return Response.redirect(url.toString(), 301);
  }
  const res = await ctx.next();
  if (!NOINDEX) return res;
  const out = new Response(res.body, res);
  out.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return out;
}

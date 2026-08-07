/**
 * Dynamically resolve parent domain for sharing sessions across subdomains and domains.
 */
export function getCookieDomain(request: Request): string | undefined {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];
  
  if (hostname === "localhost") {
    return undefined; // Let browser default to current host for localhost
  }
  
  if (hostname.endsWith(".localhost")) {
    return ".localhost";
  }

  const parts = hostname.split(".");
  if (parts.length >= 2) {
    const isDoubleExtension = hostname.endsWith(".com.np") || hostname.endsWith(".co.uk") || hostname.endsWith(".org.np");
    const dotCount = isDoubleExtension ? 3 : 2;
    if (parts.length >= dotCount) {
      return "." + parts.slice(-dotCount).join(".");
    }
  }
  return undefined;
}

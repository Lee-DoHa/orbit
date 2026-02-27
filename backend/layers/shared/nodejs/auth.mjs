/**
 * Extract user ID from Cognito JWT claims via API Gateway authorizer.
 * Returns the Cognito 'sub' claim which is the user's UUID.
 */
export function getUserSub(event) {
  const claims = event.requestContext?.authorizer?.claims;
  if (!claims?.sub) {
    throw new Error('Unauthorized: no Cognito claims found');
  }
  return claims.sub;
}

export function getUserEmail(event) {
  const claims = event.requestContext?.authorizer?.claims;
  return claims?.email || null;
}

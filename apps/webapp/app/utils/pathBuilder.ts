export function appPath() {
  return `/`;
}

export function magicLinkPath(redirectTo?: string) {
  return `/auth/magic-link${redirectTo ? `?redirect_to=${redirectTo}` : ""}`;
}

export function magicLinkVerifyPath(
  token: string,
  email: string,
  redirectTo?: string
) {
  return `/auth/magic-link/verify?token=${token}&email=${email}${
    redirectTo ? `&redirect_to=${redirectTo}` : ""
  }`;
}

export function chatPath(threadId: string) {
  return `${appPath()}/chat/${threadId}`;
}

export function configurationPath() {
  return `${appPath()}/configuration`;
}

export function knowledgeBasePath() {
  return `${appPath()}/knowledge-base`;
}

export function settingsPath() {
  return `${appPath()}/settings`;
}

export function usersPath() {
  return `${appPath()}/users`;
}

/** Maps public tool paths to their dashboard equivalents */
export const toolDashboardRoutes: Record<string, string> = {
  "/ats-score-checker": "/dashboard/scan",
  "/resume-job-description-match": "/dashboard/cv-analysis",
  "/ai-resume-optimizer": "/dashboard/optimize",
  "/cover-letter-generator": "/dashboard/cover-letter",
}

/** Returns the dashboard path if authenticated, otherwise the public path */
export function getToolHref(publicPath: string, isSignedIn: boolean): string {
  if (isSignedIn && toolDashboardRoutes[publicPath]) {
    return toolDashboardRoutes[publicPath]
  }
  return publicPath
}

/**
 * Checks if a URL is a valid HireJobs job posting URL
 */
export function isHireJobsJobUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const isHireJobsDomain = parsedUrl.hostname === 'hirejobs.in' || parsedUrl.hostname === 'www.hirejobs.in';
      const jobPathPattern = /^\/jobs\/[a-zA-Z0-9]+$/;
      const hasValidJobPath = jobPathPattern.test(parsedUrl.pathname);
      
      return isHireJobsDomain && hasValidJobPath;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Extracts the job ID from a HireJobs URL
   */
  export function extractJobId(url: string): string | null {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.pathname.startsWith('/jobs/')) {
        return parsedUrl.pathname.split('/').pop() || null;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
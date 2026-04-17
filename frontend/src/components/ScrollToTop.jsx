import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * 
 * Resets the window scroll position to (0,0) every time the 
 * URL route changes. This replicates standard browser behavior
 * for Single Page Applications (SPAs).
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset scroll to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // 'instant' ensures the user doesn't see the scroll happening during navigation
    });
  }, [pathname]);

  return null;
}

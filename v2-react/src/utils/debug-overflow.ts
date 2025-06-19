export function detectOverflow() {
  const docWidth = document.documentElement.offsetWidth;
  const elements: Array<{ element: HTMLElement, width: number, right: number }> = [];

  // Find all elements that might be causing overflow
  document.querySelectorAll('*').forEach((el) => {
    const element = el as HTMLElement;
    const rect = element.getBoundingClientRect();
    
    if (rect.width > docWidth || rect.right > docWidth) {
      elements.push({
        element,
        width: rect.width,
        right: rect.right
      });
    }
  });

  // Log problematic elements
  if (elements.length > 0) {
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Elements causing horizontal overflow:');
      elements.forEach(({ element, width, right }) => {
        console.log({
          element,
          class: element.className,
          id: element.id,
          width,
          right,
          overflow: right - docWidth
        });
      });
      console.groupEnd();
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ No horizontal overflow detected');
    }
  }

  return elements;
}

export function fixCommonOverflowIssues() {
  // Add overflow-x: hidden to html and body
  document.documentElement.style.overflowX = 'hidden';
  document.body.style.overflowX = 'hidden';
  
  // Ensure all containers have max-width: 100%
  const containers = document.querySelectorAll('div, section, header, main, footer');
  containers.forEach((container) => {
    const el = container as HTMLElement;
    const computed = window.getComputedStyle(el);
    
    if (computed.position === 'absolute' || computed.position === 'fixed') {
      // Check if element extends beyond viewport
      const rect = el.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Fixed element extending beyond viewport:', el);
        }
        el.style.maxWidth = '100vw';
      }
    }
  });
}
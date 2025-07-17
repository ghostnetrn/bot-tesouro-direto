/**
 * Tesouro Direto - Modern Financial UI
 * Responsive Table Handler
 */

class ResponsiveTable {
  constructor() {
    // Cache DOM elements for better performance
    this.table = null;
    this.scrollHint = null;
    this.headers = null;
    this.rows = null;

    // Track current state to avoid unnecessary updates
    this.currentBreakpoint = '';

    this.init();
  }

  init() {
    // Cache DOM elements
    this.cacheElements();

    // Initial setup
    this.setupResponsiveTable();
    this.setupResizeListener();
    this.setupKeyboardNavigation();
  }

  cacheElements() {
    this.table = document.getElementById('tesouro');
    this.scrollHint = document.querySelector('.table-scroll-hint');

    if (this.table) {
      this.headers = this.table.querySelectorAll('th');
      this.rows = this.table.querySelectorAll('tbody tr');
    }
  }

  setupResponsiveTable() {
    // Check if we're on mobile
    this.adjustTableForScreenSize();

    // Add accessibility attributes to the table
    if (this.table) {
      this.table.setAttribute('role', 'grid');
      this.table.setAttribute('aria-label', 'Tabela de Títulos do Tesouro Direto');

      // Add data-label attributes to cells for mobile view
      this.addDataLabels();
    }
  }

  addDataLabels() {
    if (!this.table) return;

    const headerTexts = Array.from(this.headers).map(header => header.textContent.trim());
    const rows = this.table.querySelectorAll('tbody tr');

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      cells.forEach((cell, index) => {
        if (index < headerTexts.length) {
          cell.setAttribute('data-label', headerTexts[index]);

          // Add priority classes to cells based on header
          if (this.headers[index].classList.contains('priority-high')) {
            cell.classList.add('priority-high');
          } else if (this.headers[index].classList.contains('priority-medium')) {
            cell.classList.add('priority-medium');
          } else if (this.headers[index].classList.contains('priority-low')) {
            cell.classList.add('priority-low');
          }
        }
      });
    });
  }

  setupResizeListener() {
    // Debounce function to prevent excessive calls during resize
    let resizeTimer;

    // Listen for window resize events
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.adjustTableForScreenSize();
      }, 250); // Wait for 250ms after resize ends
    });
  }

  setupKeyboardNavigation() {
    if (!this.table) return;

    // Add keyboard navigation for horizontal scrolling
    this.table.addEventListener('keydown', (e) => {
      // If user is tabbing through the table
      if (e.key === 'ArrowRight' && this.currentBreakpoint !== 'lg') {
        const tableContainer = this.table.closest('.table-container');
        if (tableContainer) {
          tableContainer.scrollLeft += 100; // Scroll right
          e.preventDefault();
        }
      } else if (e.key === 'ArrowLeft' && this.currentBreakpoint !== 'lg') {
        const tableContainer = this.table.closest('.table-container');
        if (tableContainer) {
          tableContainer.scrollLeft -= 100; // Scroll left
          e.preventDefault();
        }
      }
    });

    // Add keyboard support for the scroll hint
    if (this.scrollHint) {
      this.scrollHint.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          // Focus on the table when Enter or Space is pressed on the hint
          this.table.focus();
          e.preventDefault();
        }
      });
    }
  }

  adjustTableForScreenSize() {
    if (!this.table) {
      // Re-cache elements if they weren't available initially (e.g., after dynamic content load)
      this.cacheElements();
      if (!this.table) return;
    }

    try {
      const screenWidth = window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth;

      let newBreakpoint = '';

      // Determine current breakpoint
      if (screenWidth < 576) {
        newBreakpoint = 'xs';
      } else if (screenWidth < 768) {
        newBreakpoint = 'sm';
      } else if (screenWidth < 992) {
        newBreakpoint = 'md';
      } else {
        newBreakpoint = 'lg';
      }

      // Only update if breakpoint changed (prevents unnecessary DOM operations)
      if (this.currentBreakpoint !== newBreakpoint) {
        this.currentBreakpoint = newBreakpoint;

        // Very small screens (mobile phones)
        if (newBreakpoint === 'xs' || newBreakpoint === 'sm') {
          // Mobile view is handled by CSS now (card layout)
          this.showScrollHint(false);
        }
        // Medium screens
        else if (newBreakpoint === 'md') {
          this.showScrollHint(true);
        }
        // Large screens
        else {
          this.showScrollHint(false);
        }
      }
    } catch (error) {
      console.error('Error detecting screen size:', error);
    }
  }

  /**
   * Show or hide the scroll hint
   * @param {boolean} show - Whether to show the scroll hint
   */
  showScrollHint(show) {
    if (this.scrollHint) {
      this.scrollHint.style.display = show ? 'block' : 'none';

      // Update ARIA attributes
      if (show) {
        this.scrollHint.removeAttribute('aria-hidden');
      } else {
        this.scrollHint.setAttribute('aria-hidden', 'true');
      }
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.responsiveTable = new ResponsiveTable();

  // Add mutation observer to handle dynamic content
  const tableBody = document.getElementById('treasuryBondsTableBody');
  if (tableBody) {
    const observer = new MutationObserver(() => {
      if (window.responsiveTable) {
        window.responsiveTable.addDataLabels();
      }
    });

    observer.observe(tableBody, { childList: true });
  }
});
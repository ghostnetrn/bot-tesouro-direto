/**
 * Fix for progress bar and alert display
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function () {
  // Function to ensure progress bar reaches 100% before hiding alert
  function fixProgressDisplay() {
    // Monitor when DataTable is initialized to know when loading is complete
    let isDataTableInitialized = false;
    let isDashboardUpdated = false;
    let allowHiding = false;

    // Override the original DataTable initialization
    const originalDataTable = $.fn.DataTable;
    $.fn.DataTable = function (options) {
      const result = originalDataTable.call(this, options);

      // Mark DataTable as initialized
      isDataTableInitialized = true;

      // Check if we should hide the alert
      checkLoadingComplete();

      return result;
    };

    // Override updateDashboard function
    const originalUpdateDashboard = window.updateDashboard;
    if (typeof originalUpdateDashboard === 'function') {
      window.updateDashboard = function () {
        const result = originalUpdateDashboard.apply(this, arguments);

        // Mark dashboard as updated
        isDashboardUpdated = true;

        // Check if we should hide the alert
        checkLoadingComplete();

        return result;
      };
    }

    // Function to check if loading is complete
    function checkLoadingComplete() {
      if (isDataTableInitialized && isDashboardUpdated) {
        // Both DataTable and Dashboard are ready, hide alert
        const alertElement = document.getElementById('alerta');
        const progressBar = document.getElementById('alerta_progresso');

        if (alertElement && progressBar) {
          // Set progress to 100%
          progressBar.style.width = '100%';

          // Wait longer to ensure user sees completion, especially on mobile
          setTimeout(() => {
            // Allow hiding and hide the alert
            allowHiding = true;
            alertElement.style.display = 'none';
            alertElement.style.opacity = '1';
            alertElement.style.transition = '';
          }, 1500); // Increased delay for mobile compatibility
        }

        // Reset flags for next loading
        isDataTableInitialized = false;
        isDashboardUpdated = false;
      }
    }

    // Intercept attempts to hide the alert prematurely
    const alertElement = document.getElementById('alerta');

    if (alertElement) {
      // Create a more robust interceptor
      const originalSetAttribute = alertElement.setAttribute;

      alertElement.setAttribute = function (name, value) {
        if (name === 'style' && value.includes('display: none') && !allowHiding) {
          console.log('Preventing premature alert hiding via setAttribute');
          return;
        }
        return originalSetAttribute.call(this, name, value);
      };

      // Override the style property to prevent premature hiding
      let originalDisplay = alertElement.style.display;

      Object.defineProperty(alertElement.style, 'display', {
        get: function () {
          return originalDisplay;
        },
        set: function (value) {
          if (value === 'none' && !allowHiding) {
            console.log('Preventing premature alert hiding via style.display');
            return;
          }
          originalDisplay = value;
          // Use the original setAttribute to actually change the display
          originalSetAttribute.call(alertElement, 'style',
            (alertElement.getAttribute('style') || '').replace(/display:\s*[^;]+;?/g, '') + `display: ${value};`);
        }
      });

      // Function to allow hiding when appropriate
      window.allowAlertHiding = function () {
        allowHiding = true;
      };
    }
  }

  // Apply the fix
  fixProgressDisplay();
});
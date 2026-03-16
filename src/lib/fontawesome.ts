/**
 * =============================================================================
 * Font Awesome Configuration
 * =============================================================================
 * Configures Font Awesome to prevent FOUC (Flash of Unstyled Content)
 * by adding the CSS manually before components render.
 */

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

// Prevent Font Awesome from adding its CSS since we imported it above
config.autoAddCss = false;

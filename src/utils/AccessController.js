/**
 * Utility class to manage and check user access modules and permissions based on `OrgUserAccessModules`.
 */
class AccessController {
  /**
   * Initialize or retrieve the saved permissions data from Profile or Session Storage.
   * Typically `OrgUserAccessModules` is stored in the local sessionStorage after login or getProfile().
   */
  static getModules() {
    try {
      // 1. Check direct key
      const rawDirect = sessionStorage.getItem("OrgUserAccessModules");
      if (rawDirect) return JSON.parse(rawDirect);

      // 2. Check within known keys
      const knownKeys = ["userData", "userProfile", "profile", "user_data", "auth"];
      for (const key of knownKeys) {
        const val = sessionStorage.getItem(key);
        if (val && (val.startsWith("{") || val.startsWith("["))) {
          try {
            const parsed = JSON.parse(val);
            if (parsed.OrgUserAccessModules) return parsed.OrgUserAccessModules;
            if (parsed.data?.userData?.[0]?.OrgUserAccessModules) return parsed.data.userData[0].OrgUserAccessModules;
            if (parsed.data?.OrgUserAccessModules) return parsed.data.OrgUserAccessModules;
            if (Array.isArray(parsed) && parsed[0]?.OrgUserAccessModules) return parsed[0].OrgUserAccessModules;
          } catch (e) {}
        }
      }

      // 3. Final Fallback: Scan ALL keys
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (knownKeys.includes(key)) continue;
        const val = sessionStorage.getItem(key);
        if (val && (val.startsWith("{") || val.startsWith("["))) {
          try {
            const parsed = JSON.parse(val);
            if (parsed.OrgUserAccessModules) return parsed.OrgUserAccessModules;
          } catch (e) {}
        }
      }
      return null;
    } catch (error) {
      console.error("AccessController error:", error);
      return null;
    }
  }

  static getModuleConfig(moduleName) {
    const modules = this.getModules();
    if (!modules) return null;
    
    // Try exact match first
    if (modules[moduleName]) return modules[moduleName];

    // Case-insensitive fallback
    const lowerName = moduleName.toLowerCase();
    const foundKey = Object.keys(modules).find(k => k.toLowerCase() === lowerName);
    return foundKey ? modules[foundKey] : null;
  }

  /**
   * Check if user has ZERO access (None)
   * @param {string} moduleName 
   */
  static isNone(moduleName) {
    const config = this.getModuleConfig(moduleName);
    if (!config) return true; // Default to none if not found
    return config.access == 0 || config.access === "0";
  }

  /**
   * Check if user has READ-ONLY access
   * @param {string} moduleName 
   */
  static isRead(moduleName) {
    const config = this.getModuleConfig(moduleName);
    if (!config) return false;
    return config.access == 1 || config.access === "1";
  }

  /**
   * Check if user has WRITE access (or full access)
   * @param {string} moduleName 
   */
  static isWrite(moduleName) {
    const config = this.getModuleConfig(moduleName);
    if (!config) return false;
    return config.access == 2 || config.access === "2";
  }

  /**
   * Check if user has AT LEAST Read access (1 or 2)
   * Basically anything greater than 0
   * @param {string} moduleName 
   */
  static hasAccess(moduleName) {
    return this.isRead(moduleName) || this.isWrite(moduleName);
  }

  // ==========================================
  // ACTION PERMISSIONS
  // ==========================================

  /**
   * Can download reports/files for this module?
   * @param {string} moduleName 
   */
  static canDownload(moduleName) {
    const config = this.getModuleConfig(moduleName);
    if (!config) return false;
    return config.can_download == 1 || config.can_download === "1";
  }

  static canEmail(moduleName) {
    const config = this.getModuleConfig(moduleName);
    if (!config) return false;
    return config.can_email == 1 || config.can_email === "1";
  }

  static canWhatsApp(moduleName) {
    const config = this.getModuleConfig(moduleName);
    if (!config) return false;
    return config.can_whatsapp == 1 || config.can_whatsapp === "1";
  }

  // ==========================================
  // SPECIFIC HELPERS (Examples as requested)
  // ==========================================

  // --- EVENT MODULE ---
  static hasEventAccess() { return this.hasAccess("Event"); }
  static isEventRead() { return this.isRead("Event"); }
  static isEventWrite() { return this.isWrite("Event"); }

  // --- INSIGHT MODULE ---
  static hasInsightAccess() { return this.hasAccess("Insight"); }
  static isInsightRead() { return this.isRead("Insight"); }
  static isInsightWrite() { return this.isWrite("Insight"); }

  static canInsightDownload() { return this.canDownload("Insight"); }
  static canInsightEmail() { return this.canEmail("Insight"); }
  static canInsightWhatsApp() { return this.canWhatsApp("Insight"); }

  // --- MYEVENTS UI SPECIFIC checks ---

  /**
   * Wrapper for UI to decide if Edit/Delete/Copy buttons should be visible
   * If a user only has "Read" event access, return false (so buttons can be disabled/hidden)
   */
  static canEditOrDeleteEvent() {
    // Requires write access to "Event" module
    return this.isWrite("Event");
  }
}

export default AccessController;

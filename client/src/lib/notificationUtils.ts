/**
 * Utility functions for handling notifications
 */

export class NotificationUtils {
  private static audioCache: HTMLAudioElement | null = null;

  /**
   * Plays the notification chime sound
   * @param volume - Volume level between 0 and 1 (default: 0.5)
   */
  static playNotificationChime(volume: number = 0.5): void {
    try {
      // Only play in browser environment
      if (typeof window === "undefined") return;

      // Create audio element if not cached
      if (!this.audioCache) {
        this.audioCache = new Audio("/notification-chime.mp3");
        this.audioCache.preload = "auto";
      }

      // Set volume and play
      this.audioCache.volume = Math.max(0, Math.min(1, volume));
      this.audioCache.currentTime = 0; // Reset to beginning

      // Play the sound (handle potential promise rejection)
      const playPromise = this.audioCache.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Autoplay was prevented, ignore this error
          console.debug("Notification sound autoplay prevented:", error);
        });
      }
    } catch (error) {
      console.error("Error playing notification chime:", error);
    }
  }

  /**
   * Checks if the current tab/window has focus
   * @returns boolean indicating if window is focused
   */
  static isWindowFocused(): boolean {
    if (typeof document === "undefined") return true;
    return !document.hidden && document.hasFocus();
  }

  /**
   * Plays notification chime only if window is not focused
   * @param volume - Volume level between 0 and 1 (default: 0.5)
   */
  static playNotificationChimeIfUnfocused(volume: number = 0.5): void {
    if (!this.isWindowFocused()) {
      this.playNotificationChime(volume);
    }
  }

  /**
   * Preloads the notification sound for better performance
   */
  static preloadNotificationSound(): void {
    try {
      if (typeof window !== "undefined" && !this.audioCache) {
        this.audioCache = new Audio("/notification-chime.mp3");
        this.audioCache.preload = "auto";
      }
    } catch (error) {
      console.error("Error preloading notification sound:", error);
    }
  }
}

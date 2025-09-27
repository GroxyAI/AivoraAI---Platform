// Push notification service for the chat app
export interface NotificationPermission {
  granted: boolean
  denied: boolean
  default: boolean
}

export class NotificationService {
  private static instance: NotificationService
  private registration: ServiceWorkerRegistration | null = null

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications")
      return { granted: false, denied: true, default: false }
    }

    if (Notification.permission === "granted") {
      return { granted: true, denied: false, default: false }
    }

    if (Notification.permission === "denied") {
      return { granted: false, denied: true, default: false }
    }

    try {
      const permission = await Notification.requestPermission()
      return {
        granted: permission === "granted",
        denied: permission === "denied",
        default: permission === "default",
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error)
      return { granted: false, denied: true, default: false }
    }
  }

  async registerServiceWorker(): Promise<void> {
    if (!("serviceWorker" in navigator)) {
      console.warn("Service workers are not supported")
      return
    }

    try {
      this.registration = await navigator.serviceWorker.register("/sw.js")
      console.log("Service worker registered successfully")
    } catch (error) {
      console.error("Service worker registration failed:", error)
    }
  }

  async showNotification(
    title: string,
    options: {
      body?: string
      icon?: string
      badge?: string
      tag?: string
      data?: any
    } = {},
  ): Promise<void> {
    if (Notification.permission !== "granted") {
      console.warn("Notification permission not granted")
      return
    }

    const defaultOptions = {
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [200, 100, 200],
      ...options,
    }

    if (this.registration) {
      await this.registration.showNotification(title, defaultOptions)
    } else {
      new Notification(title, defaultOptions)
    }
  }

  async notifyNewMessage(characterName: string, message: string): Promise<void> {
    await this.showNotification(`New message from ${characterName}`, {
      body: message.length > 100 ? message.substring(0, 100) + "..." : message,
      tag: "new-message",
      data: { type: "message", characterName },
    })
  }

  async notifyCharacterResponse(characterName: string): Promise<void> {
    await this.showNotification(`${characterName} is typing...`, {
      body: "Your character is preparing a response",
      tag: "character-typing",
      data: { type: "typing", characterName },
    })
  }

  getPermissionStatus(): NotificationPermission {
    if (!("Notification" in window)) {
      return { granted: false, denied: true, default: false }
    }

    return {
      granted: Notification.permission === "granted",
      denied: Notification.permission === "denied",
      default: Notification.permission === "default",
    }
  }
}

export const notificationService = NotificationService.getInstance()

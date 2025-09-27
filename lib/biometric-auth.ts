export interface BiometricAuthResult {
  success: boolean
  error?: string
}

export class BiometricAuth {
  static async isSupported(): Promise<boolean> {
    if (!window.PublicKeyCredential) {
      return false
    }

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      return available
    } catch {
      return false
    }
  }

  static async register(username: string): Promise<BiometricAuthResult> {
    try {
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: "Aivora.ai",
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(username),
            name: username,
            displayName: username,
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        },
      })) as PublicKeyCredential

      if (credential) {
        // Store credential ID for future authentication
        localStorage.setItem("biometricCredentialId", credential.id)
        return { success: true }
      }

      return { success: false, error: "Failed to create credential" }
    } catch (error: any) {
      return { success: false, error: error.message || "Biometric registration failed" }
    }
  }

  static async authenticate(): Promise<BiometricAuthResult> {
    try {
      const credentialId = localStorage.getItem("biometricCredentialId")
      if (!credentialId) {
        return { success: false, error: "No biometric credential found" }
      }

      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [
            {
              id: Uint8Array.from(atob(credentialId), (c) => c.charCodeAt(0)),
              type: "public-key",
            },
          ],
          userVerification: "required",
          timeout: 60000,
        },
      })

      if (credential) {
        return { success: true }
      }

      return { success: false, error: "Authentication failed" }
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        return { success: false, error: "Authentication was cancelled" }
      }
      return { success: false, error: error.message || "Biometric authentication failed" }
    }
  }

  static removeBiometric(): void {
    localStorage.removeItem("biometricCredentialId")
  }
}

// Enhanced content filtering system similar to Character.AI
export interface ContentWarning {
  level: "low" | "medium" | "high" | "blocked"
  categories: string[]
  message: string
  showWarning: boolean
}

export const CONTENT_CATEGORIES = {
  VIOLENCE: {
    keywords: [
      "violence",
      "blood",
      "death",
      "kill",
      "murder",
      "fight",
      "weapon",
      "gun",
      "knife",
      "stab",
      "shoot",
      "attack",
      "hurt",
      "pain",
      "wound",
      "injury",
      "torture",
      "abuse",
    ],
    level: "medium" as const,
    name: "Violence",
  },
  DRUGS: {
    keywords: [
      "drug",
      "drugs",
      "cocaine",
      "heroin",
      "marijuana",
      "weed",
      "alcohol",
      "drunk",
      "high",
      "smoke",
      "smoking",
      "addiction",
      "overdose",
      "pills",
      "prescription",
    ],
    level: "medium" as const,
    name: "Substance Use",
  },
  SEXUAL: {
    keywords: [
      "sexual",
      "sex",
      "adult",
      "mature",
      "intimate",
      "nude",
      "naked",
      "porn",
      "erotic",
      "arousal",
      "orgasm",
      "masturbate",
      "breast",
      "penis",
      "vagina",
    ],
    level: "high" as const,
    name: "Sexual Content",
  },
  SELF_HARM: {
    keywords: [
      "suicide",
      "self harm",
      "self-harm",
      "cut myself",
      "kill myself",
      "end my life",
      "want to die",
      "cutting",
      "razor",
      "blade",
      "depression",
      "hopeless",
    ],
    level: "blocked" as const,
    name: "Self-Harm",
  },
  PROFANITY: {
    keywords: ["fuck", "shit", "damn", "hell", "bitch", "asshole", "bastard", "crap"],
    level: "low" as const,
    name: "Strong Language",
  },
} as const

export const analyzeContent = (content: string): ContentWarning => {
  const unhingedMode = typeof window !== "undefined" && localStorage.getItem("unhinged-mode") === "true"
  const ukUser = typeof window !== "undefined" && localStorage.getItem("uk-user") === "true"
  const heaaVerified = typeof window !== "undefined" && localStorage.getItem("heaa-verified") === "true"

  // UK users without HEAA verification get stricter filtering
  if (ukUser && !heaaVerified && !localStorage.getItem("dev-account")) {
    const lowerContent = content.toLowerCase()

    // Block primary priority content for unverified UK users
    const primaryPriorityKeywords = [
      "suicide",
      "self harm",
      "self-harm",
      "kill myself",
      "end my life",
      "eating disorder",
      "anorexia",
      "bulimia",
      "purging",
      "pornography",
      "explicit sexual",
      "graphic sexual",
    ]

    const hasPrimaryPriority = primaryPriorityKeywords.some((keyword) => lowerContent.includes(keyword))

    if (hasPrimaryPriority) {
      return {
        level: "blocked",
        categories: ["Primary Priority Content"],
        message: "This content is restricted for UK users under 18. Age verification required.",
        showWarning: true,
      }
    }
  }

  if (unhingedMode && (!ukUser || heaaVerified || localStorage.getItem("dev-account"))) {
    return {
      level: "low",
      categories: [],
      message: "",
      showWarning: false,
    }
  }

  const lowerContent = content.toLowerCase()
  const detectedCategories: string[] = []
  let highestLevel: "low" | "medium" | "high" | "blocked" = "low"
  let showWarning = false

  // Check each category
  Object.entries(CONTENT_CATEGORIES).forEach(([key, category]) => {
    const hasMatch = category.keywords.some((keyword) => lowerContent.includes(keyword))

    if (hasMatch) {
      detectedCategories.push(category.name)

      // Update highest level
      const levels = ["low", "medium", "high", "blocked"]
      if (levels.indexOf(category.level) > levels.indexOf(highestLevel)) {
        highestLevel = category.level
      }

      showWarning = true
    }
  })

  const getMessage = (): string => {
    if (highestLevel === "blocked") {
      return "This message contains content that may be harmful. If you're experiencing thoughts of self-harm, please reach out for help."
    }
    if (highestLevel === "high") {
      return "This message contains mature content that may not be suitable for all users."
    }
    if (highestLevel === "medium") {
      return "This message contains content that some users may find concerning."
    }
    return "This message contains mild content warnings."
  }

  return {
    level: highestLevel,
    categories: detectedCategories,
    message: getMessage(),
    showWarning: showWarning || detectedCategories.length > 0,
  }
}

export const getFilterColor = (level: "low" | "medium" | "high" | "blocked"): string => {
  switch (level) {
    case "blocked":
      return "red"
    case "high":
      return "red"
    case "medium":
      return "yellow"
    case "low":
      return "orange"
    default:
      return "gray"
  }
}

export const shouldBlockMessage = (level: "low" | "medium" | "high" | "blocked"): boolean => {
  const unhingedMode = typeof window !== "undefined" && localStorage.getItem("unhinged-mode") === "true"
  const ukUser = typeof window !== "undefined" && localStorage.getItem("uk-user") === "true"
  const heaaVerified = typeof window !== "undefined" && localStorage.getItem("heaa-verified") === "true"

  // UK users without HEAA verification have stricter blocking
  if (ukUser && !heaaVerified && !localStorage.getItem("dev-account")) {
    return level === "blocked" || level === "high"
  }

  if (unhingedMode && (!ukUser || heaaVerified || localStorage.getItem("dev-account"))) {
    return false
  }

  return level === "blocked" || level === "high" || level === "medium"
}

export const isUkCompliant = (): boolean => {
  if (typeof window === "undefined") return true

  const ukUser = localStorage.getItem("uk-user") === "true"
  const heaaVerified = localStorage.getItem("heaa-verified") === "true"
  const devAccount = localStorage.getItem("dev-account") === "true"

  return !ukUser || heaaVerified || devAccount
}

export const getComplianceMessage = (): string => {
  if (typeof window === "undefined") return ""

  const ukUser = localStorage.getItem("uk-user") === "true"
  const heaaVerified = localStorage.getItem("heaa-verified") === "true"

  if (ukUser && !heaaVerified) {
    return "UK users require age verification to access all features under the Online Safety Act 2023."
  }

  return ""
}

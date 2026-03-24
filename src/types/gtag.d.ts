declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer?: any[]
    scrollDepth25?: boolean
    scrollDepth50?: boolean
    scrollDepth75?: boolean
    scrollDepth90?: boolean
  }
}

export {}

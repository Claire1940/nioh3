import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center gap-1.5">
            {index > 0 && <span className="text-gray-500">/</span>}
            {item.href ? (
              <Link href={item.href} className="transition-colors text-gray-300 hover:text-white">
                {item.label}
              </Link>
            ) : (
              <span className="font-normal text-gray-100">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

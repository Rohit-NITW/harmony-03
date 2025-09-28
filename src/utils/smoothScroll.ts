export const smoothScrollTo = (targetId: string) => {
  const element = document.getElementById(targetId.replace('#', ''))
  if (element) {
    const headerHeight = 80 // Account for sticky header
    const elementPosition = element.getBoundingClientTop() + window.pageYOffset
    const offsetPosition = elementPosition - headerHeight

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}

export const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault()
  const href = e.currentTarget.getAttribute('href')
  if (href?.startsWith('#')) {
    smoothScrollTo(href)
  }
}
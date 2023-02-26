import React from 'react'

export const useDisclose = (initialState?: boolean) => {
  const [isOpen, setIsOpen] = React.useState(initialState ?? false)
  return {
    isOpen,
    onOpen: () => setIsOpen(true),
    onClose: () => setIsOpen(false),
    onToggle: () => setIsOpen(s => !s),
  }
}

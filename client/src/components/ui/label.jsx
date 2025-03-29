"use client"
 
import * as React from "react"
 
const Label = React.forwardRef(({ className, children, htmlFor, ...props }, ref) => {
  return (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-gray-700 mb-1 ${className || ""}`}
      {...props}
    >
      {children}
    </label>
  )
})
Label.displayName = "Label"
 
export { Label }

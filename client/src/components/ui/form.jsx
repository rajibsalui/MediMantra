"use client"

import * as React from "react"
import { useFormContext, FormProvider } from "react-hook-form"

const Form = ({ form, className, children, ...props }) => (
  <FormProvider {...form}>
    <form className={className} {...props}>
      {children}
    </form>
  </FormProvider>
)
Form.displayName = "Form"

const FormField = ({ name, children, ...props }) => {
  const formContext = useFormContext()
  
  if (!formContext) {
    throw new Error("FormField must be used within a Form component that has a valid form prop")
  }
  
  const { control } = formContext
  
  return (
    <div className="space-y-2" {...props}>
      {typeof children === "function" ? children(control, name) : children}
    </div>
  )
}
FormField.displayName = "FormField"

const FormItem = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={`space-y-2 ${className}`} {...props} />
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={`text-sm font-medium leading-none text-gray-700 ${className}`}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef(({ className, ...props }, ref) => {
  return <div ref={ref} className={className} {...props} />
})
FormControl.displayName = "FormControl"

const FormMessage = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={`text-sm font-medium text-red-500 ${className}`}
      {...props}
    />
  )
})
FormMessage.displayName = "FormMessage"

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
}

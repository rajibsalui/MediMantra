import React from "react";

export const ButtonGroup = ({ 
  className, 
  children,
  ...props 
}) => {
  return (
    <div 
      className={`inline-flex rounded-md shadow-sm ${className}`} 
      role="group"
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) {
          return child;
        }

        return React.cloneElement(child, {
          className: `${child.props.className || ''} ${
            index === 0 
              ? "rounded-r-none" 
              : index === React.Children.count(children) - 1 
                ? "rounded-l-none" 
                : "rounded-none"
          } ${
            index !== 0 ? "border-l-0" : ""
          }`,
        });
      })}
    </div>
  );
};

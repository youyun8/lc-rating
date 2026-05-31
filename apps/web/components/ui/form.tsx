"use client";

import * as React from "react";
import { FormProvider } from "react-hook-form";

import { cn } from "@/lib/utils";

const Form = FormProvider;

function FormMessage({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) {
  if (!children) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      className={cn("text-destructive-foreground text-sm", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export { Form, FormMessage };

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import React from "react";

export function AppBreadcrumb({ directories }) {
  return (
    <Breadcrumb className="mb-2">
      <BreadcrumbList>
        {directories.map((directory, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {index === directories.length - 1 ? (
                <BreadcrumbPage>{directory.name}</BreadcrumbPage>
              ) : (
                <Link href={directory.link}>{directory.name}</Link>
              )}
            </BreadcrumbItem>
            {index < directories.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

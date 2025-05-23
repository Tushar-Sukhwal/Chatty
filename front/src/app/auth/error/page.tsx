import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function authError({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  return (
    <div className="h-screen flex justify-center items-center flex-col p-4">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
        <Image
          src="/images/error.svg"
          width={500}
          height={500}
          alt="error"
          className="w-full h-auto"
        />
      </div>
      <p className="text-base md:text-xl text-center mt-4 md:mt-6">
        {searchParams["message"] ?? ""}
      </p>
      <Link href="/" className="mt-4 md:mt-6">
        <Button className="text-sm md:text-base">Back to home</Button>
      </Link>
    </div>
  );
}

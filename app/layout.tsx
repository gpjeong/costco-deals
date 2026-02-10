import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "코스트코 주간 할인",
  description: "코스트코 코리아 주간 할인 상품을 한눈에 확인하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="font-pretendard antialiased">
        {children}
      </body>
    </html>
  );
}

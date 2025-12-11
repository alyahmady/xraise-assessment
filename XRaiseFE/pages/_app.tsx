import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

import "../styles.css";

type PagePropsWithSession = {
  session?: Session;
  [key: string]: unknown;
};

export default function App({ Component, pageProps }: AppProps<PagePropsWithSession>) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PEE | Planejamento Estratégico Evolucionário — ABO Academy',
  description: 'Construa a estratégia da sua organização enquanto desenvolve líderes capazes de concebê-la, assumi-la e prepará-la para a execução.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}

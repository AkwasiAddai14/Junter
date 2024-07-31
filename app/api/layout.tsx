export const metadata = {
  title: 'Junter',
  description: 'Uitzendbureau',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

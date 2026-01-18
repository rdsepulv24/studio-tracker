import './globals.css'

export const metadata = {
  title: 'Studio Tracker',
  description: 'Track your architecture practice',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

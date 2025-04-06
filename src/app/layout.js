import './globals.css';

export const metadata = {
  title: 'Sports Celebrity Reels',
  description: 'AI-generated history reels for sports celebrities',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white overflow-hidden">
        <main className="fixed inset-0 h-screen w-screen overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
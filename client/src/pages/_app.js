import '@/app/globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/components/toast-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { DoctorProvider } from '@/contexts/DoctorContext';
import { PatientProvider } from '@/contexts/PatientContext';
import { AppointmentProvider } from '@/contexts/AppointmentContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <ToastProvider />
      <AuthProvider>
        <DoctorProvider>
          <PatientProvider>
            <AppointmentProvider>
              <ChatProvider>
                <div className="flex min-h-screen w-full flex-col bg-background text-foreground antialiased transition-colors duration-200">
                  <Header />
                  <main className="flex-1">
                    <Component {...pageProps} />
                  </main>
                  <Footer />
                </div>
                <Toaster position="top-right" />
              </ChatProvider>
            </AppointmentProvider>
          </PatientProvider>
        </DoctorProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
